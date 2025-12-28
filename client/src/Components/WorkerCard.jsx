import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';

const WorkerCard = ({ worker, onViewDetails }) => {
  return (
    <Card className="worker-card mb-3 border-0 shadow-sm hover-lift" style={{ transition: 'transform 0.2s' }}>
      <Card.Body>
        <Row>
          <Col md={2} className="text-center">
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#17a2b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 auto'
              }}
            >
              {worker.fname?.charAt(0).toUpperCase()}
              {worker.lname?.charAt(0).toUpperCase()}
            </div>
          </Col>
          <Col md={7}>
            <h5 className="mb-2">{worker.fname} {worker.lname}</h5>
            <div className="rating mb-2">
              <FaStar className="text-warning" />
              <span className="ms-1 fw-bold">
                {worker.stats?.averageRating > 0 ? worker.stats.averageRating.toFixed(1) : 'N/A'}
              </span>
              <span className="text-muted ms-1">
                ({worker.stats?.totalReviews || 0} reviews)
              </span>
            </div>
            <div className="skills mb-2">
              {worker.skills?.split(',').slice(0, 3).map((skill, idx) => (
                <Badge key={idx} bg="info" className="me-1">
                  {skill.trim()}
                </Badge>
              ))}
              {worker.skills?.split(',').length > 3 && (
                <Badge bg="secondary">+{worker.skills.split(',').length - 3} more</Badge>
              )}
            </div>
            <div className="details">
              <small className="text-muted">
                <FaMapMarkerAlt className="me-1" />
                {worker.location || worker.address || 'Not specified'}
              </small>
              <small className="text-muted ms-3">
                <FaBriefcase className="me-1" />
                {worker.stats?.completedJobs || 0} jobs completed
              </small>
            </div>
          </Col>
          <Col md={3} className="text-end">
            <div className="mb-2">
              <Badge bg="success">Available</Badge>
            </div>
            <div className="mb-3">
              <small className="text-muted">About:</small>
              <p className="small mb-0" style={{ maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {worker.about || 'No description available'}
              </p>
            </div>
            <Button
              variant="outline-info"
              size="sm"
              onClick={onViewDetails}
              className="w-100"
            >
              View More Details
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default WorkerCard;
