export function PlusPage() {
  return (
    <div className="flex justify-center items-center w-screen h-screen w-screen">
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
            <hr />
          </div>

          <div className="flex gap">
            <div className="box flex-1">
              <h3 className="text-lg" id="stripe">
                Stripe
              </h3>
              <div className="my-2">
                <a
                  href="https://buy.stripe.com/8wMeYLcVybTQgwwbIK"
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
                <code>pico+</code> that will be converted to a full year after we received it.
              </p>
            </div>
          </div>

          <div className="box">
            <h3 className="text-lg" id="membership-notifications">
              Membership Notifications
            </h3>

            <p>
              We provide a special RSS feed for all pico users in order for us to
              send direct notifications. This is where we will send you{" "}
              <code>pico+</code> expiration notifications. To be clear, this is
              opt-in because we do not collect your email address.
            </p>

            <pre>https://auth.pico.sh/rss/:token</pre>

            <p>
              With <a href="https://pico.sh/feeds">feeds.sh</a>, create <code>pico.txt</code>:
            </p>

            <pre>{`=: email rss@myemail.com
  =: digest_interval 1day
  => https://auth.pico.sh/rss/:token`}</pre>

            <pre>rsync pico.txt feeds.sh:/</pre>
          </div>

          <div className="box">
            <h3 className="text-lg" id="notes">
              Notes
            </h3>

            <p>
              We do not maintain active subscriptions for <code>pico+</code>.
              Every year you must pay again. We do not take monthly payments, you
              must pay for a year up-front. Pricing is subject to change because
              we plan on continuing to include more services as we build them.
            </p>

            <p>
              Need higher limits? We are more than happy to extend limits. Just message us and we can
              chat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
