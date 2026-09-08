import { useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

type AgoraVideoRoomProps = {
  channelName?: string;
};

export function AgoraVideoRoom({ channelName = "dosje-inspection" }: AgoraVideoRoomProps) {
  const [sdkVersion] = useState(() => AgoraRTC.VERSION);

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-slate-950 p-4 text-slate-100">
      <h3 className="text-sm font-medium">WebRTC room (Agora placeholder)</h3>
      <p className="mt-1 text-xs text-slate-400">
        Channel `{channelName}` · SDK {sdkVersion}. Token join is not wired yet.
      </p>
      <div className="mt-3 grid aspect-video place-items-center rounded-md bg-slate-900 text-sm text-slate-500">
        Local and remote video tracks will render here
      </div>
    </section>
  );
}
