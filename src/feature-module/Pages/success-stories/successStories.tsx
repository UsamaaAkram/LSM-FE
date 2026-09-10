import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import {
  fetchSuccessStories,
} from "../../../core/redux/successStorySlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";

const PLATFORM_BADGE: Record<string, { icon: string; label: string }> = {
  tiktok: { icon: "fa-brands fa-tiktok", label: "TikTok" },
  youtube: { icon: "fa-brands fa-youtube", label: "YouTube" },
  instagram: { icon: "fa-brands fa-instagram", label: "Instagram" },
  facebook: { icon: "fa-brands fa-facebook-f", label: "Facebook" },
  other: { icon: "isax isax-video", label: "Video" },
};

const SuccessStories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stories, loading } = useSelector(
    (state: RootState) => (state as any).successStory
  );
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    dispatch(fetchSuccessStories({ search, platform }) as any);
  }, [dispatch, search, platform]);

  const featured = stories.find((s: any) => s.featured) || stories[0];

  return (
    <>
      <Breadcrumb title="Success Stories" />
      <section className="content">
        <div className="container py-4">
          <div className="text-center mx-auto mb-4" style={{ maxWidth: 640 }}>
            <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
              Real Results
            </span>
            <h2 className="mb-2">Student Success Stories</h2>
            <p className="text-muted mb-0">
              Real creators who went through Bluverse and turned their skills
              into income.
            </p>
          </div>

          {featured && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4 d-flex flex-wrap gap-4 align-items-center">
                <ImageGlobal
                  src={featured.thumbnailUrl}
                  alt={featured.studentName}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                />
                <div style={{ flex: 1, minWidth: 240 }}>
                  <span className="badge bg-secondary mb-2">Featured</span>
                  <h4 className="mb-1">{featured.title}</h4>
                  <p className="text-muted mb-2">— {featured.studentName}</p>
                  <p className="mb-2">{featured.story}</p>
                  {featured.videoUrl && (
                    <a
                      href={featured.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i
                        className={
                          PLATFORM_BADGE[featured.platform || "other"].icon +
                          " me-1"
                        }
                      />
                      Watch on{" "}
                      {PLATFORM_BADGE[featured.platform || "other"].label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="row mb-4 g-2 justify-content-between align-items-center">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or story..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="">All Platforms</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner-border" />
            </div>
          ) : !stories.length ? (
            <div className="text-center text-muted py-5">
              No success stories yet.
            </div>
          ) : (
            <div className="row row-gap-4">
              {stories.map((s: any) => (
                <div className="col-lg-4 col-md-6" key={s._id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-img-top overflow-hidden rounded-top position-relative">
                      <ImageGlobal
                        src={s.thumbnailUrl}
                        alt={s.studentName}
                        height={200}
                      />
                      <span
                        className="badge bg-dark position-absolute top-0 end-0 m-2 d-inline-flex align-items-center"
                        style={{ opacity: 0.85 }}
                      >
                        <i
                          className={
                            PLATFORM_BADGE[s.platform || "other"].icon +
                            " me-1"
                          }
                        />
                        {PLATFORM_BADGE[s.platform || "other"].label}
                      </span>
                    </div>
                    <div className="card-body">
                      <h5 className="mb-1">{s.title}</h5>
                      <p className="text-muted mb-2">— {s.studentName}</p>
                      <p className="mb-0" style={{ fontSize: 14 }}>
                        {s.story?.slice(0, 140)}
                        {s.story?.length > 140 ? "…" : ""}
                      </p>
                      {s.videoUrl && (
                        <a
                          href={s.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-secondary mt-3"
                        >
                          Watch Story
                        </a>
                      )}
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

export default SuccessStories;
