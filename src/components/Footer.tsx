export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-serif">Lumidumi</h3>
            <p className="text-white/70">
              Handcrafted candles that illuminate your space with warmth and elegance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-cream-300 transition-colors">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-white/70 hover:text-cream-300 transition-colors">
                <span className="sr-only">Instagram</span>
                📷
              </a>
              <a href="#" className="text-white/70 hover:text-cream-300 transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/products" className="text-white/70 hover:text-cream-300 transition-colors">Products</a></li>
              <li><a href="/custom-orders" className="text-white/70 hover:text-cream-300 transition-colors">Custom Orders</a></li>
              <li><a href="/about" className="text-white/70 hover:text-cream-300 transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-white/70 hover:text-cream-300 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="/shipping" className="text-white/70 hover:text-cream-300 transition-colors">Shipping Info</a></li>
              <li><a href="/returns" className="text-white/70 hover:text-cream-300 transition-colors">Returns</a></li>
              <li><a href="/faq" className="text-white/70 hover:text-cream-300 transition-colors">FAQ</a></li>
              <li><a href="/track-order" className="text-white/70 hover:text-cream-300 transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-white/70">
              <p>📧 team@lumidumi.com</p>
              <p>📱 +91 93548 51086</p>
              <p>📍 Delhi, India</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
          <p>&copy; 2024 Lumidumi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}