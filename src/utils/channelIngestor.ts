import { db } from "../shared/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import axios from "axios";
import { TVChannel } from "./tvChannelMap";

const CHANNELS_COLLECTION = "live_channels";
const BATCH_SIZE = 500;

export interface IngestionStatus {
  totalFound: number;
  processed: number;
  batchCount: number;
  isFinished: boolean;
  error?: string;
}

export const channelIngestor = {
  /**
   * Fetches data from iptv-org and uploads to Firestore in batches.
   * This is intended to be called from an admin UI or dev console.
   */
  async ingestFromIptvOrg(onProgress?: (status: IngestionStatus) => void): Promise<void> {
    const status: IngestionStatus = {
      totalFound: 0,
      processed: 0,
      batchCount: 0,
      isFinished: false
    };

    try {
      console.log("Fetching channels from iptv-org...");
      // Fetching channels and streams. We merge them.
      const [channelsRes, streamsRes] = await Promise.all([
        axios.get("https://iptv-org.github.io/api/channels.json"),
        axios.get("https://iptv-org.github.io/api/streams.json")
      ]);

      const channelsData = channelsRes.data;
      const streamsData = streamsRes.data;

      // Map streams to channels by channel ID
      const streamMap = new Map();
      streamsData.forEach((s: any) => {
        if (!streamMap.has(s.channel)) {
          streamMap.set(s.channel, s.url);
        }
      });

      const mappedChannels: TVChannel[] = channelsData
        .filter((c: any) => streamMap.has(c.id))
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          url: streamMap.get(c.id),
          category: c.categories?.[0] || "General",
          country: c.countries?.[0]?.name || "Global",
          countryCode: c.countries?.[0]?.code || "GL",
          logo: c.logo || "",
          type: "hls",
          isExternal: true
        }));

      status.totalFound = mappedChannels.length;
      onProgress?.({ ...status });

      console.log(`Found ${status.totalFound} valid channels. Starting upload...`);

      // Upload in batches
      for (let i = 0; i < mappedChannels.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = mappedChannels.slice(i, i + BATCH_SIZE);

        chunk.forEach(channel => {
          const channelRef = doc(collection(db, CHANNELS_COLLECTION), channel.id);
          batch.set(channelRef, channel);
        });

        await batch.commit();
        status.processed += chunk.length;
        status.batchCount++;
        onProgress?.({ ...status });
        console.log(`Uploaded batch ${status.batchCount} (${status.processed}/${status.totalFound})`);
      }

      status.isFinished = true;
      onProgress?.({ ...status });
      console.log("Ingestion complete!");

    } catch (error: any) {
      console.error("Ingestion failed:", error);
      let errorMsg = error.message;
      if (error.code === 'permission-denied' || error.message?.includes('403')) {
        errorMsg = "Access Denied: Please enable billing on your Google Cloud Project to use Firestore for large datasets.";
      }
      status.error = errorMsg;
      onProgress?.({ ...status });
      throw new Error(errorMsg);
    }
  }
};
