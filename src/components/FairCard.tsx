import { Fair } from "@/api";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";

interface FairCardProps {
  fair: Fair;
}

function formatMMDD(dateStr: string) {
  const date = new Date(dateStr);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

export const FairCard = ({ fair }: FairCardProps) => {
  return (
    <a href={fair.redirect_url} target="_blank" rel="noopener noreferrer">
      <div className="border border-[#E2DFDB] rounded-2xl overflow-hidden w-full shadow-lg">
        <div className="flex flex-col md:flex-row w-full">
          {/* 좌측 이미지 */}
          <div className="w-full md:w-3/5 h-auto relative flex-shrink-0">
            <Image
              src={fair.image_url}
              alt={fair.title}
              className="w-full h-auto rounded-t-2xl md:rounded-2xl md:max-h-[230px]"
              width={700}
              height={300}
            />
          </div>
          {/* 우측 정보 */}
          <div className="flex flex-col justify-between p-6 md:p-8">
            <div>
              <div className="text-xs text-[#A89B87] mb-1 font-medium">
                {fair.category1} &gt; {fair.category2}
              </div>
              <h3 className="text-2xl font-extrabold text-[#262626] mb-2 line-clamp-1">
                {fair.title}
              </h3>
              <div className="flex items-center text-base text-[#262626] font-normal mb-1">
                <Calendar className="w-4 h-4 mr-2 text-[#A89B87]" />
                {formatMMDD(fair.start_date)} ~ {formatMMDD(fair.end_date)}
              </div>
              <div className="flex items-start text-sm text-[#262626] mb-4">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-[#A89B87]" />
                <span className="line-clamp-2">{fair.address}</span>
              </div>
            </div>
          </div>
        </div>
        {/* 박람회 소개 */}
        <div className="text-[#493D32] text-base px-8 py-5 rounded-b-2xl flex flex-col items-start gap-3">
          <span className="font-bold min-w-[80px]">박람회 소개</span>
          <div className="w-full bg-[#F7EEE6] rounded-xl px-4 py-3">
            <span className="whitespace-pre-line leading-relaxed">
              {fair.promotion || fair.description}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};
