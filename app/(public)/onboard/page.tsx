import { MediaGrid } from "@/features/media/components/MediaGrid";
import PromptComposer from "@/features/media/components/prompt/PromptComposer";
import { fetchWithToken } from "@/lib/fetcher";
import { Media } from "@/features/media/types/media";

export default async function OnboardPage() {
   const mediaLinks = [
  { url: "https://drive.google.com/uc?export=view&id=1jTSoMXc0QnskR8yaTQyzSK-Ti5OhMRHm", type: "image", aspectRatio: "1:1" },
  { url: "https://drive.google.com/uc?export=view&id=1y01VbkW6SkYYNFZR2gr2mHbq7fJ8okvi", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1CG1SoTblE24xiTI1gBBjkHzelwI8Lq8P", type: "video", aspectRatio: "9:16" },
  { url: "https://drive.google.com/uc?export=view&id=1aatD-ioKFFAbTDvLvo7ZBKT7ExbVaXv9", type: "video", aspectRatio: "4:3" },
  { url: "https://drive.google.com/uc?export=view&id=1Pk45y1qbfVsQ23gpMYE7aZklwP5gHl1U", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1Wuk-93Vii0JzCayYLnOCY5qaTlmcaGB9", type: "image", aspectRatio: "3:4" },
  { url: "https://drive.google.com/uc?export=view&id=14f9T9SEa0rOine4g18T630K370vK74k-", type: "video", aspectRatio: "9:16" },
  { url: "https://drive.google.com/uc?export=view&id=1ktnUIhZ6cNm9q9a92IzsIHhlebvlUmbn", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1Or3SHkzU1NTIqpxc9Pb9RBfQVPE-QORm", type: "image", aspectRatio: "1:1" },
  { url: "https://drive.google.com/uc?export=view&id=1eELAudFWqosee1rjwVLK3NJwp0LYKvnm", type: "image", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1F-whm7MTQXbP_T8MC8PekxPh3s-MLtrC", type: "video", aspectRatio: "9:16" },
  { url: "https://drive.google.com/uc?export=view&id=1Z_dVzEreqlQRXX-xMzSoTsRp_bO5clr4", type: "video", aspectRatio: "3:4" },
  { url: "https://drive.google.com/uc?export=view&id=1uLHG1e1zo_ccls4zWgAotcszATul7heQ", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=10m255WV1cbGvB0I1GYS0SKDB0EJRSUMC", type: "video", aspectRatio: "9:16" },
  { url: "https://drive.google.com/uc?export=view&id=1FQ_PHafdJZEFfSuW-2W90RozU0favg0X", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1QsNbbhR0To6RtSGEe3p7Oev-xovd3sil", type: "video", aspectRatio: "1:1" },
  { url: "https://drive.google.com/uc?export=view&id=1gJFyGDzWHKhiWMsi9xITvKVlK6qG07Pb", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1DhViqCrC3fkjQXBV6mFXMpShyDdioP_T", type: "video", aspectRatio: "9:16" },
  { url: "https://drive.google.com/uc?export=view&id=1a440gU6sEKhxoiaOqeg5L8wikLtl9naz", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1rAs3JmX3k0IcG2CjNXG9PCZ9VuG42ea9", type: "image", aspectRatio: "4:3" },
  { url: "https://drive.google.com/uc?export=view&id=1IoxZWhsg4ZWPXJngtXqxCLIjwejfA6GL", type: "image", aspectRatio: "1:1" },
  { url: "https://drive.google.com/uc?export=view&id=10qF4Kuw7hnAaKSLsPDVo6N8PT_YibUn8", type: "image", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1ennIVz02qt1XpfcCXb3_X0AJ-VhvJvKg", type: "image", aspectRatio: "9:16" },
  { url: "https://drive.google.com/uc?export=view&id=1vIYYGKsf8-5TI7ctk6uyUEsi4Ezbn5dq", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1RJiRmU-aYl602WAyJkn1e77O9s9Mfzzs", type: "video", aspectRatio: "9:16" },
  { url: "https://drive.google.com/uc?export=view&id=1gUJIRdPdXYrSq0Ha7E_cCaBdYicdbpwc", type: "video", aspectRatio: "1:1" },
  { url: "https://drive.google.com/uc?export=view&id=1L9kqdnCMBWvVtOGqj5HZqW8Cj3ZaNbTH", type: "video", aspectRatio: "16:9" },
  { url: "https://drive.google.com/uc?export=view&id=1gl2lij-kiHz1751jbxlvVtohUMOW98va", type: "video", aspectRatio: "9:16" }
];



  const media: Media[] = mediaLinks.map((item, index) => ({
    id: `mock-${index}`,
    url: item.url,
    type: item.type as "image" | "video",
    aspectRatio: item.aspectRatio as any,
    width: 1080,
    height: 1920,
    format: item.type === "video" ? "mp4" : "jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  return (
    <div className="w-full h-full">
      <section className="sm:w-1/2 w-full  fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
        <PromptComposer />
      </section>

      <div className="">
        <section className=" overflow-y-auto  ">
          <MediaGrid media={media} breakpointCols={{ default: 3,1600:4, 1450:4, 1200: 3, 940: 2 }} />
        </section>
      </div>
    </div>
  );
}
