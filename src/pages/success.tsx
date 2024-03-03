import { RssBox } from "@app/shared";

export function SuccessPage() {
  return (
    <div className="group">
      <h1 className="text-xl">Thank you for your payment!</h1>
      <p>Your membership will be activated shortly.</p>
      <RssBox />
    </div>
  );
}
