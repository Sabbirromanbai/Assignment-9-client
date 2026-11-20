export const CART_STORAGE_KEY = "pizzabari-cart"
export const CART_CHANGE_EVENT = "pizzabari:cart-change"

export type CartItemInput = {
  id: string
  name: string
  price: number
  image?: string | null
  category?: string | null
}

export type CartLine = CartItemInput & {
  quantity: number
  addedAt: string
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false

  const line = value as Partial<CartLine>

  return (
    typeof line.id === "string" &&
    line.id.length > 0 &&
    typeof line.name === "string" &&
    typeof line.price === "number" &&
    Number.isFinite(line.price) &&
    line.price >= 0 &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0
  )
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isCartLine)
  } catch {
    return []
  }
}

export function addCartItem(
  input: CartItemInput
): { cart: CartLine[]; count: number } {
  if (typeof window === "undefined") {
    throw new Error("Cart changes can only be made in the browser")
  }

  const id = input.id?.trim()
  if (!id) {
    throw new Error("A product id is required")
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error("A valid product price is required")
  }

  const name = input.name?.trim() || "Menu item"
  const cart = readCart()
  const existing = cart.find((line) => line.id === id)

  const next = existing
    ? cart.map((line) =>
        line.id === id
          ? {
              ...line,
              name,
              price: input.price,
              image: input.image ?? line.image,
              category: input.category ?? line.category,
              quantity: line.quantity + 1,
            }
          : line
      )
    : [
        ...cart,
        {
          id,
          name,
          price: input.price,
          image: input.image ?? null,
          category: input.category ?? null,
          quantity: 1,
          addedAt: new Date().toISOString(),
        } satisfies CartLine,
      ]

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next))

  const count = next.reduce((total, line) => total + line.quantity, 0)
  window.dispatchEvent(
    new CustomEvent(CART_CHANGE_EVENT, {
      detail: { count, cart: next },
    })
  )

  return { cart: next, count }
}
