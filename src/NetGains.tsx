export const NetGains = ({
  net,
  cumulativeNet,
  numberOfPreviousDays,
}: {
  net: number;
  cumulativeNet: number | undefined;
  numberOfPreviousDays: number | undefined;
}) => {
  return (
    <>
      <h2>
        Net:
        <span
          className={`
          ${
            net > 0 ? 'text-green-400'
            : net == 0 ? 'text-blue-400'
            : 'text-red-400'
          } px-4
          `}
        >
          {net > 0 ? '+' : null}
          {net}
        </span>
      </h2>
      {cumulativeNet != null ?
        <h2>
          Cumulative Net (Prior {numberOfPreviousDays} days):
          <span
            className={`
          ${
            cumulativeNet + net > 0 ? 'text-green-400'
            : cumulativeNet + net == 0 ? 'text-blue-400'
            : 'text-red-400'
          } px-4
          `}
          >
            {cumulativeNet + net > 0 ? '+' : null}
            {cumulativeNet + net}
          </span>
        </h2>
      : null}
    </>
  );
};
