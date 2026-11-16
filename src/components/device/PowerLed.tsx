/** The power LED. Pulses while idle, blinks three times on a bingo. */
export function PowerLed({
  on,
  pulse = false,
  blink = false,
}: {
  on: boolean;
  pulse?: boolean;
  blink?: boolean;
}) {
  return (
    <span
      className="led"
      data-on={on}
      data-pulse={on && pulse && !blink}
      data-blink={blink}
      aria-hidden="true"
    />
  );
}
