import { ExternalLink, RssBox } from "@app/shared";

export function SuccessPage() {
  return (
    <div className="group">
      <h1 className="text-xl">Thank you for your payment!</h1>
      <p>
        Your <code>pico+</code> membership has been activated.
      </p>
      <RssBox />
      <div className="group box">
        <div>Read our docs to start using our services:</div>
        <div>
          <ExternalLink
            href="https://pico.sh/getting-started#next-steps"
            className="btn-link"
            rel="noreferrer"
          >
            Getting Started
          </ExternalLink>
        </div>
      </div>
    </div>
  );
}
