import { motion, useReducedMotion } from "framer-motion";
import type { Addon, Package, Product } from "../lib/api";
import { fadeUp, staggerContainer } from "../lib/motion";

type Props = {
  products: Product[];
  packages: Package[];
  addons: Addon[];
};

function formatRange(min?: number | null, max?: number | null) {
  if (min == null && max == null) return "Quote";
  if (max == null || min === max) return `₹${min}`;
  return `₹${min} – ₹${max}`;
}

export function Pricing({ products, packages, addons }: Props) {
  const reduceMotion = useReducedMotion();
  const apparel = products.filter((p) => p.category === "apparel");
  const fallbackApparel =
    apparel.length > 0
      ? apparel
      : ([
          {
            id: "round-neck",
            name: "Round Neck T-Shirt",
            material: "180 GSM Cotton",
            individual: { singleSide: { min: 299, max: 349 }, frontBack: { min: 399, max: 499 } },
            bulk: [
              { quantity: "10-25", min: 250, max: 280 },
              { quantity: "26-50", min: 230, max: 260 },
              { quantity: "51-100", min: 210, max: 240 },
              { quantity: "100+", min: null, max: null, quoteBased: true },
            ],
            recommendedPrice: 299,
          },
          {
            id: "polo",
            name: "Polo T-Shirt",
            material: "220 GSM Cotton",
            individual: { singleSide: { min: 399, max: 499 }, frontBack: { min: 499, max: 599 } },
            bulk: [
              { quantity: "10-25", min: 350, max: 400 },
              { quantity: "26-50", min: 330, max: 380 },
              { quantity: "51-100", min: 300, max: 350 },
              { quantity: "100+", min: null, max: null, quoteBased: true },
            ],
            recommendedPrice: 449,
          },
          {
            id: "cap",
            name: "Cap",
            material: "Cotton Cap",
            individual: { singleSide: { min: 249, max: 299 }, frontBack: { min: 299, max: 349 } },
            bulk: [
              { quantity: "10-25", min: 200, max: 220 },
              { quantity: "26-50", min: 180, max: 200 },
              { quantity: "51-100", min: 170, max: 190 },
              { quantity: "100+", min: null, max: null, quoteBased: true },
            ],
            recommendedPrice: 249,
          },
        ] as Product[]);

  const pkgs =
    packages.length > 0
      ? packages
      : [
          {
            id: "birthday",
            name: "Birthday Package",
            description: "Celebrations",
            price: 2499,
            quoteBased: false,
            items: "10 Printed T-Shirts",
          },
          {
            id: "school",
            name: "School Package",
            description: "Uniforms",
            price: null,
            quoteBased: true,
            items: "50 Uniform T-Shirts",
          },
          {
            id: "corporate",
            name: "Corporate Package",
            description: "Team branding",
            price: null,
            quoteBased: true,
            items: "100 Polo T-Shirts with Logo",
          },
        ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <div>
            <p className="text-brand-orange font-semibold text-sm tracking-wider uppercase mb-2">
              Wear your style
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy">Price List</h2>
            <p className="mt-3 text-navy/60 max-w-lg">
              Individual and bulk apparel pricing. Final quote depends on design complexity and
              finish.
            </p>
          </div>
          <p className="font-script text-2xl text-brand-orange">Print your ideas, wear your style.</p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-5 mb-14"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {fallbackApparel.map((p) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className="rounded-2xl border border-navy/10 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="bg-navy px-5 py-4">
                <h3 className="font-display font-bold text-white">{p.name}</h3>
                {p.material && <p className="text-xs text-white/60 mt-1">{p.material}</p>}
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy/60">Single side</span>
                  <span className="font-semibold text-navy">
                    {formatRange(p.individual.singleSide?.min, p.individual.singleSide?.max)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/60">Front + back</span>
                  <span className="font-semibold text-navy">
                    {formatRange(p.individual.frontBack?.min, p.individual.frontBack?.max)}
                  </span>
                </div>
                {p.recommendedPrice && (
                  <p className="text-xs text-brand-orange font-medium pt-1">
                    Popular local price ≈ ₹{p.recommendedPrice}
                  </p>
                )}
                <div className="pt-3 border-t border-navy/8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-navy/40 mb-2">
                    Bulk / piece
                  </p>
                  <ul className="space-y-1.5">
                    {p.bulk.map((b) => (
                      <li key={b.quantity} className="flex justify-between text-xs">
                        <span className="text-navy/55">{b.quantity} pcs</span>
                        <span className="font-medium text-navy">
                          {b.quoteBased ? "Quote based" : formatRange(b.min, b.max)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mb-14"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h3 className="font-display text-xl font-bold text-navy mb-4">Special Packages</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {pkgs.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="rounded-2xl bg-slate-50 border border-navy/8 p-5 hover:border-brand-orange/40 transition-colors"
              >
                <h4 className="font-display font-semibold text-navy">{pkg.name}</h4>
                <p className="text-xs text-navy/50 mt-1">{pkg.items}</p>
                <p className="mt-4 font-display text-2xl font-bold text-brand-orange">
                  {pkg.quoteBased || pkg.price == null ? "Custom quote" : `₹${pkg.price}`}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <h3 className="font-display text-xl font-bold text-navy mb-4">Premium Add-ons</h3>
          <div className="flex flex-wrap gap-2">
            {(addons.length
              ? addons
              : [
                  { id: "1", name: "Glow in the Dark", priceMin: 100, priceMax: 100 },
                  { id: "2", name: "Metallic / Gold", priceMin: 100, priceMax: 100 },
                  { id: "3", name: "Puff (3D)", priceMin: 100, priceMax: 150 },
                  { id: "4", name: "Embroidery", priceMin: 100, priceMax: 200 },
                  { id: "5", name: "Name & Number", priceMin: 50, priceMax: 100 },
                ]
            ).map((a) => (
              <motion.span
                key={a.id}
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                className="inline-flex items-center gap-2 rounded-full bg-navy text-white text-xs px-3 py-1.5"
              >
                {a.name}
                <span className="text-brand-orange">
                  +₹{a.priceMin}
                  {a.priceMax !== a.priceMin ? `–${a.priceMax}` : ""}
                </span>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
