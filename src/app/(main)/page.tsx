"use client";

import { useEffect, useState } from "react";
import { City, getMainCities } from "@/api";
import Banner from "./_components/Banner";
import CityFairSection from "./_components/CityFairSection";
import Image from "next/image";

export default function Home() {
  const [mainCities, setMainCities] = useState<City[]>([]);

  useEffect(() => {
    const fetchMainCities = async () => {
      try {
        const citiesData = await getMainCities();
        setMainCities(citiesData);
      } catch (error) {
        console.error("Error fetching main cities:", error);
      }
    };

    fetchMainCities();
  }, []);

  return (
    <div>
      {/* 메인 배너 이미지 */}
      <Image
        src="/images/MainBanner.jpeg"
        alt="메인 배너"
        className="w-full h-auto mb-10 object-cover hidden md:block"
        width={2150}
        height={672}
      />

      {/* 배너 슬라이더 섹션 */}
      <Banner />

      {/* 도시별 웨딩 박람회 섹션 */}
      {mainCities.map((city) => (
        <CityFairSection key={city.id} city={city} />
      ))}
    </div>
  );
}
