"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStructuredData } from "@/api/seoApi";
import Script from "next/script";
import { City, getMainCities, getAllSubCities } from "@/api";

// 구조화 데이터를 가져오는 클라이언트 컴포넌트
function StructuredDataScript() {
  const [structuredData, setStructuredData] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructuredData = async () => {
      try {
        const { structured_data } = await getStructuredData("3");
        setStructuredData(structured_data);
      } catch (err) {
        console.error("구조화 데이터 로딩 중 오류:", err);
      }
    };

    fetchStructuredData();
  }, []);

  if (!structuredData) return null;

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: structuredData }}
      strategy="afterInteractive"
    />
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  // 모바일 메뉴 관련 상태 복구
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mainCities, setMainCities] = useState<City[]>([]);
  const [subCities, setSubCities] = useState<{ [key: number]: City[] }>({});
  const [expandedCity, setExpandedCity] = useState<number | null>(null);
  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState("");
  // 드롭다운 상태를 number | false로 변경
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | false>(false);

  // 페이지가 변경될 때마다 검색어 초기화
  useEffect(() => {
    setSearchQuery("");
  }, [pathname]);

  // mainCities, subCities fetch 복구
  useEffect(() => {
    const fetchData = async () => {
      try {
        const citiesData = await getMainCities();
        setMainCities(citiesData);
        const allSubCitiesData = await getAllSubCities();
        const mainCitiesArray: City[] = [];
        const subCitiesData: { [key: number]: City[] } = {};
        for (const [cityIdStr, cityData] of Object.entries(allSubCitiesData)) {
          const cityId = parseInt(cityIdStr);
          mainCitiesArray.push({
            id: cityId,
            name: cityData.name,
          });
          subCitiesData[cityId] = cityData.sub_cities;
        }
        setMainCities(mainCitiesArray);
        setSubCities(subCitiesData);
      } catch (error) {
        console.error("데이터 가져오기 오류:", error);
      }
    };
    fetchData();
  }, []);

  // 모바일 메뉴 토글 함수
  const handleMobileMenuClick = (cityId: number) => {
    setExpandedCity(expandedCity === cityId ? null : cityId);
  };

  // 모바일 서브 카테고리 클릭 함수
  const handleSubCityClick = (mainCityId: number, subCityId: number) => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    setExpandedCity(null);
    const mainCity = mainCities.find((city) => city.id === mainCityId);
    const subCity = subCities[mainCityId]?.find(
      (city) => city.id === subCityId
    );
    if (!mainCity || !subCity) {
      console.error("카테고리 정보를 찾을 수 없습니다.");
      return;
    }
    router.push(
      `/detail?main=${mainCity.name}&sub=${subCity.name}&mainName=${mainCity.name}&subName=${subCity.name}`
    );
  };

  // 검색 처리 함수
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery("");
    setIsMenuOpen(false);
    if (!searchQuery.trim()) return;
    // 검색 결과 페이지로 이동
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF]">
      <StructuredDataScript />

      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full bg-[#262626]">
        {/* 첫 번째 줄: 로고 + 검색창 */}
        <div className="flex items-center justify-between h-16 max-w-screen-xl mx-auto px-6">
          {/* 좌측 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-black text-[#9E856F]">
                MYWEDDING
              </span>
            </Link>
          </div>
          {/* 검색창 */}
          <div className="relative hidden md:flex items-center flex-grow ml-4 md:ml-8 max-w-sm">
            <form onSubmit={handleSearch} className="w-full flex">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="박람회 이름으로 검색"
                  className="w-full py-2 px-4 pr-10 border-b-2 bg-[#262626] border-[#FFFFFF] focus:outline-none placeholder:text-sm placeholder:text-[#898989] text-white caret-white"
                  onFocus={(e) =>
                    e.target.classList.add("placeholder-transparent")
                  }
                  onBlur={(e) =>
                    e.target.classList.remove("placeholder-transparent")
                  }
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 px-3 text-white"
                  aria-label="검색"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
          {/* 모바일 메뉴 버튼 */}
          <div className="flex md:hidden items-center ml-2 flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:hidden rounded-full text-white"
              aria-label="메뉴"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 - header 태그 안에 위치 */}
        {isMenuOpen && (
          <nav className="fixed top-16 left-0 w-full z-50 bg-white border-t border-gray-200 shadow-lg md:hidden py-4 px-4 space-y-2">
            <div className="relative flex items-center flex-grow md:ml-8">
              <form onSubmit={handleSearch} className="w-full flex mb-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="박람회 이름으로 검색"
                    className="w-full py-2 px-4 pr-10 border-b-2 border-gray-200 focus:border-gray-500 focus:outline-none placeholder:text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 px-3 text-gray-600"
                    aria-label="검색"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
            {mainCities.map((city) => (
              <div
                key={city.id}
                className="border-b border-gray-100 last:border-b-0"
              >
                <button
                  onClick={() => handleMobileMenuClick(city.id)}
                  className="flex items-center justify-between w-full py-3 px-2 text-gray-700 hover:text-black"
                >
                  <span>{city.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedCity === city.id ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedCity === city.id && subCities[city.id] && (
                  <div className="pl-4 py-2 bg-gray-50">
                    {subCities[city.id].map((subCity) => (
                      <button
                        key={subCity.id}
                        onClick={() => handleSubCityClick(city.id, subCity.id)}
                        className="block w-full text-left py-2 px-2 text-gray-600 hover:text-black text-sm"
                      >
                        {subCity.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* 두 번째 줄: 중앙 고정 메뉴 */}
        <nav className="hidden md:flex items-center text-[13px] text-[#FFFFFF] font-normal max-w-screen-xl mx-auto px-6 h-12">
          {mainCities.map((city) => (
            <div
              key={city.id}
              className="relative h-12 flex items-center"
              onMouseEnter={() => setIsDropdownOpen(city.id)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                type="button"
                className={`h-12 flex items-center px-3 hover:text-[#9E856F] transition-colors ${
                  isDropdownOpen === city.id ? "text-[#9E856F]" : ""
                }`}
                style={{ fontWeight: 500 }}
              >
                {city.name}
              </button>
              {isDropdownOpen === city.id && (
                <div className="absolute left-0 top-12 min-w-[140px] bg-white border-t border-gray-200 shadow-lg z-50 px-4 py-4">
                  {subCities[city.id] && subCities[city.id].length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {subCities[city.id].map((subCity) => (
                        <button
                          key={subCity.id}
                          onClick={() =>
                            handleSubCityClick(city.id, subCity.id)
                          }
                          className="text-left text-[#6d6253] hover:text-[#9E856F] text-base py-1"
                        >
                          {subCity.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[#A09183] text-sm">
                      서브 카테고리 없음
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </header>

      {/* children 렌더링 */}
      <main className="flex-1 w-full max-w-screen-xl mx-auto bg-[#FFFFFF]">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">마이 웨딩</h2>
            <p className="text-gray-400 text-sm">우리 결혼해요! 마이웨딩</p>
          </div>

          <div className="flex flex-wrap justify-between border-t border-gray-700 pt-6 text-xs text-gray-400">
            <div className="space-x-4">
              <Link href="/privacy" className="hover:text-white">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="hover:text-white">
                이용약관
              </Link>
              <Link href="/location" className="hover:text-white">
                유의사항
              </Link>
            </div>
            <div>Copyright © 2025. My Wedding. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}