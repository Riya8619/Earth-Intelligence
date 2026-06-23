import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";

export function useLiveIntelligence(onSnapshot) {
  const queryClient = useQueryClient();
  const onSnapshotRef = useRef(onSnapshot);

  useEffect(() => {
    onSnapshotRef.current = onSnapshot;
  }, [onSnapshot]);

  useEffect(() => {
    const wsBase = API_BASE_URL.replace(/^http/, "ws");
    const socket = new WebSocket(`${wsBase}/ws/intelligence`);

    socket.onmessage = (event) => {
      try {
        const snapshot = JSON.parse(event.data);
        queryClient.setQueryData(["events"], { events: snapshot.events || [] });
        queryClient.setQueryData(["missions"], { missions: snapshot.missions || [] });
        queryClient.setQueryData(["risks"], snapshot);
        onSnapshotRef.current?.(snapshot);
      } catch {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.invalidateQueries({ queryKey: ["missions"] });
        queryClient.invalidateQueries({ queryKey: ["risks"] });
      }
    };

    return () => socket.close();
  }, [queryClient]);
}
