import { Commentary } from "../types/match";

;

type CommentaryFeedProps = {
  commentary: Commentary[];
};

const CommentaryFeed = ({ commentary }: CommentaryFeedProps) => {
  console.log(commentary)
  return (
    <aside className="h-[80vh] w-full max-w-[380px] overflow-y-auto rounded-3xl border-2 border-black bg-white shadow-[6px_6px_0px_#000]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-black bg-sky-100 px-4 py-3">
        <h2 className="text-lg font-bold">Live Commentary</h2>

        <span className="rounded-full border border-black bg-white px-2 py-1 text-xs font-semibold">
          Real-time
        </span>
      </div>

      {/* Commentary Feed */}
      <div className="space-y-4 p-4">
        {commentary.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-500">
            Select a match to start watching commentary
          </div>
        ) : (
          commentary.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-300 bg-zinc-50 p-4"
            >
              {/* Top Bar */}
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-zinc-800">
                  {item.minute}'
                </span>

                <span className="rounded-full bg-zinc-200 px-2 py-1 text-xs">
                  {item.period}
                </span>
              </div>

              {/* Event Type */}
              <div className="mb-3">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase text-yellow-800">
                  {item.eventType.replace("_", " ")}
                </span>
              </div>

              {/* Team */}
              <h3 className="mb-2 font-bold text-zinc-900">
                {item.team}
              </h3>

              {/* Commentary Message */}
              <div className="rounded-xl bg-white p-3">
                <p className="text-sm leading-relaxed text-zinc-700">
                  {item.message}
                </p>
              </div>

              {/* Extra Details */}
              <div className="mt-3 space-y-1 text-sm text-zinc-700">
                <p>
                  <span className="font-semibold">Player:</span>{" "}
                  {item.actor}
                </p>

                {item.metaData?.assist && (
                  <p>
                    <span className="font-semibold">Assist:</span>{" "}
                    {item.metaData.assist}
                  </p>
                )}

                {item.metaData?.playerOff && (
                  <p>
                    <span className="font-semibold">Player Off:</span>{" "}
                    {item.metaData.playerOff}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default CommentaryFeed;