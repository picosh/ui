import { schema, useSelector } from "@app/api";

export function PlusPage() {
  const user = useSelector(schema.user.select);

  return (
    <div>
      <h1 className="text-2xl text-underline-hdr text-hdr inline-block">
        pico+
      </h1>
      <h2 className="text-xl">signup to get access to premium services</h2>

      <hr />

      <div className="text-center text-2xl my-4">$20/year</div>

      <div className="group mb-4">
        <div>
          There are a few ways to purchase a membership. We try our best to
          provide immediate access to <code>pico+</code> regardless of payment
          method.
        </div>

        <div className="flex gap payment-methods">
          <div className="box flex-1">
            <h3 className="text-lg" id="stripe">
              Stripe (US/CA Only)
            </h3>
            <div className="my-2">
              <a
                href={`https://buy.stripe.com/6oEaIvaNq7DA4NO9AD?client_reference_id=${user.username}`}
                className="btn-link"
                target="_blank"
                rel="noreferrer"
              >
                JOIN
              </a>
            </div>
            <p>
              This is the quickest way to access <code>pico+</code>. The Stripe
              payment method requires an email address. We will never use your
              email for anything unless absolutely necessary.
            </p>
          </div>

          <div className="box flex-1">
            <h3 className="text-lg" id="snail">
              Snail Mail
            </h3>
            <p>Send cash (USD) or check to:</p>
            <div>
              <div className="font-bold">pico.sh LLC</div>
              <div>206 E Huron St STE 103</div>
              <div>Ann Arbor MI 48104</div>
            </div>
            <p>
              Message us when payment is in transit and we will grant you
              temporary access to
              <code>pico+</code> that will be converted to a full year after we
              received it.
            </p>
          </div>
        </div>

        <div>
          <hr />
        </div>

        <div className="box">
          <h3 className="text-lg" id="notes">
            Notes
          </h3>

          <p>
            Unfortunately we do not have the labor bandwidth to support
            international users for <code>pico+</code> at this time. As a
            result, we only offer our premium services to the US and Canada.
          </p>

          <p>
            We do not maintain active subscriptions for <code>pico+</code>.
            Every year you must pay again. We do not take monthly payments, you
            must pay for a year up-front. Pricing is subject to change because
            we plan on continuing to include more services as we build them.
          </p>

          <p>
            Need higher limits? We are more than happy to extend limits. Just
            message us and we can chat.
          </p>
        </div>
      </div>
    </div>
  );
}
