import React, { useState } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PaymentForm({ jobData, worker, clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

      if (stripeError) {
        // Check if payment already succeeded
        if (stripeError.code === 'payment_intent_unexpected_state' &&
            stripeError.payment_intent?.status === 'succeeded') {
          console.log('Payment already succeeded, returning payment intent ID...');
          onSuccess(stripeError.payment_intent.id);
          return;
        }

        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Payment successful - return payment intent ID to parent
      console.log('Payment successful, payment intent ID:', paymentIntent.id);
      toast.success('Payment completed successfully!');
      setProcessing(false);
      onSuccess(paymentIntent.id);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed');
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <div className="p-3 border rounded bg-light">
          <h6 className="mb-3">Payment Details</h6>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex gap-2 justify-content-end">
        <Button variant="secondary" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <Spinner size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            `Pay LKR ${jobData.hourlyRate}`
          )}
        </Button>
      </div>
    </form>
  );
}

export default function DirectHirePaymentModal({
  show,
  onHide,
  jobData,
  worker,
  onSuccess,
}) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create payment intent when modal opens
  React.useEffect(() => {
    if (show && jobData && worker) {
      // Reset client secret and create new payment intent
      setClientSecret(null);
      createPaymentIntent();
    }
  }, [show, jobData, worker]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!show) {
      setClientSecret(null);
      setLoading(false);
    }
  }, [show]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/payments/create-direct-hire-intent', {
        workerId: worker.id,
        jobData: {
          title: jobData.title,
          hourlyRate: jobData.hourlyRate,
          categoryId: jobData.categoryId,
        },
      });
      setClientSecret(response.data.data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      onHide();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Complete Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {jobData && worker && (
          <>
            <div className="mb-4 p-3 bg-light rounded">
              <h6 className="fw-bold mb-3">Job Request Details</h6>
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Job:</strong> {jobData.title}
                  </p>
                  <p className="mb-2">
                    <strong>Worker:</strong> {worker.fname}{' '}
                    {worker.lname}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Location:</strong> {jobData.location || 'N/A'}
                  </p>
                  <p className="mb-2">
                    <strong>Hourly Rate:</strong>{' '}
                    <span className="text-primary fw-bold">
                      LKR {jobData.hourlyRate}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Initializing payment...</p>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  jobData={jobData}
                  worker={worker}
                  clientSecret={clientSecret}
                  onSuccess={onSuccess}
                  onCancel={onHide}
                />
              </Elements>
            ) : null}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
