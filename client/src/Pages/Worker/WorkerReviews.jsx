import TopNavbar from '../../Components/TopNavbar';
import React, { useEffect, useState } from 'react';

const sampleReviews = [
  { id: 1, name: 'Daniel', rating: 5, text: "Best haircut I've had in the city. They always give the best fades!", date: '16 Dec, 2016' },
  { id: 2, name: 'Jessica', rating: 4, text: "Nice place, friendly staff. A little busy on weekends.", date: '10 Jan, 2017' },
  { id: 3, name: 'Alex', rating: 2, text: "Top-notch service and clean shop.", date: '03 Feb, 2017' },
  { id: 4, name: 'Maria', rating: 3, text: "My go-to barber now — highly recommend!", date: '22 Mar, 2017' },
  { id: 5, name: 'Daniel', rating: 1, text: "Consistent and professional. Will come again.", date: '16 Dec, 2016' }
];

export default function WorkerReviews() {
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  function fetchReviews() {
    setTimeout(() => {
      setReviews(sampleReviews);
    }, 200);
  }

  // Inline SVG star (filled) and outline star
  const StarFilled = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="me-1">
      <path fill="#F1C40F" d="M12 .587l3.668 7.431L23.6 9.75l-5.8 5.656L19.336 23 12 19.412 4.664 23l1.536-7.594L.4 9.75l7.932-1.732z"/>
    </svg>
  );

  const StarOutline = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="me-1">
      <path fill="#ddd" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  );

  function renderStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? <StarFilled key={i} /> : <StarOutline key={i} />);
    }
    return <span className="d-inline-flex align-items-center">{stars}</span>;
  }

  const visibleReviews = showAll ? reviews : reviews.slice(0, 4);

  return (
    <div>
      <TopNavbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {/* <div className="text-center w-100">
                <h5 className="mb-0">Reviews</h5>
                <div style={{ height: 3, width: 80, margin: '6px auto 0' }} className="bg-primary rounded"></div>
              </div> */}
              {/* <button className="btn btn-primary ms-3">Write Review</button> */}
            </div>

            {/* Reviews list */}
            <div className="list-group ">
              {visibleReviews.map(r => (
                <div key={r.id} className="list-group-item list-group-item-action shadow-sm mb-3 rounded">
                  <div className="d-flex justify-content-between align-items-start">
                    {/* Left: name, stars, text */}
                    <div style={{ flex: 1 }}>
                      <h6 className="mb-1 text-primary" style={{ fontWeight: 600 }}>
                        {r.name}
                        <small className="ms-2 d-inline-block align-middle">{renderStars(r.rating)}</small>
                      </h6>
                      <p className="mb-2 text-muted small">{r.text}</p>
                      {/* optional: show textual rating */}
                      <div className="small text-secondary">Rated: <strong>{r.rating}/5</strong></div>
                    </div>

                    {/* Right: side table with rating (small) */}
                    <div className="ms-3 text-end" style={{ minWidth: 90 }}>
                      <table className="table table-borderless table-sm mb-0">
                        <tbody>
                          <tr>
                            <td className="p-0 align-middle" style={{ width: '70%' }}>
                              <div className="d-flex align-items-center justify-content-end">
                                {/* Show one filled star and number for quick glance */}
                                <StarFilled size={16} />
                                <span className="ms-1 fw-bold">{r.rating}</span>
                                <span className="ms-1 text-muted small">/5</span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-0">
                              <div className="text-secondary small">{r.date}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length > 4 && (
                <div className="text-center mt-2">
                  <button className="btn btn-link p-0" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show fewer' : 'Read more reviews'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .list-group-item { border: none; }
          @media (max-width: 576px) {
            .container { padding-left: 12px; padding-right: 12px; }
          }
        `}</style>
      </div>
    </div>
  );
}
