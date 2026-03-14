/**
 * Tests for order cart logic
 */

describe('Cart operations', () => {
  let cart;

  beforeEach(() => {
    cart = [];
  });

  const addToCart = (cart, product, quantity) => {
    const existing = cart.find((i) => i.productId === product._id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    } else {
      cart.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        stock: product.stock,
        quantity: Math.min(quantity, product.stock),
      });
    }
    return cart;
  };

  const calcTotal = (cart) => cart.reduce((s, i) => s + i.price * i.quantity, 0);

  test('adds product to empty cart', () => {
    const product = { _id: 'p1', title: 'Laptop', price: 999, stock: 5 };
    addToCart(cart, product, 1);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  test('increments quantity for existing product', () => {
    const product = { _id: 'p1', title: 'Laptop', price: 999, stock: 5 };
    addToCart(cart, product, 1);
    addToCart(cart, product, 2);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
  });

  test('does not exceed stock quantity', () => {
    const product = { _id: 'p1', title: 'Laptop', price: 999, stock: 3 };
    addToCart(cart, product, 10);
    expect(cart[0].quantity).toBe(3);
  });

  test('calculates total correctly', () => {
    const p1 = { _id: 'p1', title: 'Item A', price: 10, stock: 5 };
    const p2 = { _id: 'p2', title: 'Item B', price: 25, stock: 5 };
    addToCart(cart, p1, 2);
    addToCart(cart, p2, 1);
    expect(calcTotal(cart)).toBe(45);
  });

  test('removes item from cart', () => {
    const product = { _id: 'p1', title: 'Phone', price: 500, stock: 2 };
    addToCart(cart, product, 1);
    const filtered = cart.filter((i) => i.productId !== 'p1');
    expect(filtered).toHaveLength(0);
  });
});

describe('Order total calculation', () => {
  test('calculates order total from items', () => {
    const items = [
      { priceAtPurchase: 100, quantity: 2 },
      { priceAtPurchase: 50, quantity: 3 },
    ];
    const total = items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0);
    expect(total).toBe(350);
  });
});
