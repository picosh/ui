import {
  cancelPollFeatures,
  pollFeatures,
  schema,
  selectFeatureByName,
  useSelector,
} from "@app/api";
import { successUrl } from "@app/router";
import { Banner, ExternalLink } from "@app/shared";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "starfx/react";

const paymentLink = "https://buy.stripe.com/6oEaIvaNq7DA4NO9AD";

export function PlusPage() {
  const user = useSelector(schema.user.select);
  const feature = useSelector((s) => selectFeatureByName(s, { name: "pgs" }));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(cancelPollFeatures());
    dispatch(pollFeatures());

    return () => {
      dispatch(cancelPollFeatures());
    };
  }, []);

  useEffect(() => {
    if (feature && feature.id !== "") {
      dispatch(cancelPollFeatures());
    }
  }, [feature]);

  return (
    <div>
      <h1 className="text-2xl text-underline-hdr text-hdr inline-block">
        pico+
      </h1>
      <h2 className="text-xl">signup to get access to premium services</h2>

      <hr />

      <div className="text-center text-2xl my-4">$25/year</div>

      <div className="group">
        {feature && feature.id !== "" ? (
          <Banner>
            <code>pico+</code> membership activated!{" "}
            <Link to={successUrl()} className="link-alt">
              Click here to continue
            </Link>
          </Banner>
        ) : null}

        <div className="box group">
          <h3 className="text-lg">Includes</h3>
          <ul className="m-0">
            <li>
              <ExternalLink href="https://pico.sh/pgs">pgs.sh</ExternalLink> -
              10GB asset storage
            </li>
            <li>
              <ExternalLink href="https://pico.sh/tuns">tuns.sh</ExternalLink> -
              full access
            </li>
            <li>
              <ExternalLink href="https://pico.sh/imgs">imgs.sh</ExternalLink> -
              5GB image registry storage
            </li>
            <li>
              <ExternalLink href="https://pico.sh/prose">prose.sh</ExternalLink>{" "}
              - 1GB image storage
            </li>
            <li>
              <ExternalLink href="https://pico.sh/irc">
                beta access
              </ExternalLink>{" "}
              - Invited to join our private IRC channel
            </li>
          </ul>
        </div>

        <div>
          There are a few ways to purchase a membership. We try our best to
          provide immediate access to <code>pico+</code> regardless of payment
          method.
        </div>

        <div className="flex gap collapse">
          <div className="box flex-1">
            <h3 className="text-lg" id="stripe">
              Stripe (US/CA Only)
            </h3>
            <div className="my-2">
              <ExternalLink
                href={`${paymentLink}?client_reference_id=${user.name}`}
                className="btn-link"
              >
                JOIN
              </ExternalLink>
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
            Have any questions not covered here?{" "}
            <a href="mailto:hello@pico.sh">Email</a> us or join{" "}
            <ExternalLink href="https://pico.sh/irc">IRC</ExternalLink>, we will
            promptly respond.
          </p>

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
