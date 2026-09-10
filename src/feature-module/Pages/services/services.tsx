import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { formatPrice, hasPrice } from "../../../core/common/coursePrice";
import { fetchProducts } from "../../../core/redux/productSlice";
import { all_routes as routes } from "../../router/all_routes";
import type { AppDispatch, RootState } from "../../../core/redux/store";

// Shop (#42/#43) — replaces the old static "What We Offer" services page.
//
// This is the browse-and-filter grid only. Buy Now hands off to the Order
// Verification page, which owns contacting the seller and submitting payment
// proof; keeping that off the grid means the purchase flow has one home
// instead of a modal that competed with a WhatsApp link.
const Services = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector(
    (state: RootState) => (state as any).product
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    dispatch(fetchProducts({ search, category }) as any);
  }, [dispatch, search, category]);

  const categories = Array.from(
    new Set(products.map((p: any) => p.category))
  ) as string[];

  return (
    <>
      <Breadcrumb title="Shop" />
      <section className="course-content">
        <div className="container">
          <div className="text-center mx-auto mb-4" style={{ maxWidth: 640 }}>
            <h2 className="mb-2">Bluverse Shop</h2>
            <p className="text-muted mb-0">
              Monetized accounts, AI tool subscriptions, hosting, and more —
              buy via WhatsApp, no payment gateway needed.
            </p>
          </div>

          <div className="row mb-4 g-2 justify-content-between">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option value={c} key={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner-border" />
            </div>
          ) : !products.length ? (
            <div className="text-center text-muted py-5">
              No products available yet.
            </div>
          ) : (
            <div className="row row-gap-4">
              {products.map((p: any) => (
                <div className="col-lg-4 col-md-6" key={p._id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-img-top overflow-hidden rounded-top">
                      <ImageGlobal src={p.imageUrl} alt={p.title} height={180} />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <span className="badge bg-primary-transparent text-primary rounded-pill mb-2 align-self-start">
                        {p.category}
                      </span>
                      <h5 className="mb-2">{p.title}</h5>
                      <p className="text-muted mb-3" style={{ fontSize: 14 }}>
                        {p.description}
                      </p>
                      <div className="mt-auto">
                        {/* #18 — product prices are free text now, so
                            Number() would render "Rs NaN" for a label like
                            "Contact Us". formatPrice adds the Rs and
                            separators for real amounts and passes labels
                            through untouched. */}
                        {hasPrice(p.price) && (
                          <p className="fs-18 fw-bold text-secondary mb-2">
                            {formatPrice(p.price)}
                          </p>
                        )}
                        {/* Buy Now now opens a real Order Verification page
                            (contact the seller, then submit proof) instead of
                            jumping straight to WhatsApp with the separate
                            "I've Paid" modal beside it — the client's note was
                            that "I've paid" had nowhere to go. */}
                        <Link
                          to={`${routes.shopOrderVerification}?product=${p._id}`}
                          className="btn btn-primary w-100"
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </>
  );
};

export default Services;
