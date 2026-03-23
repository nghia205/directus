"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Briefcase,
  ChevronDown,
  User as UserIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import Sidebar from "../component/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hook/useDebounce";
import { useRouter } from "next/navigation";
import { useHandleAuthError } from "../hook/useHandleAuthError";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://silvatek.vn:8080";

const Data = () => {
  const { token } = useAuth();
  const { handleAuthError } = useHandleAuthError();
  const router = useRouter();

  // State dữ liệu
  const [people, setPeople] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // State UI
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // Debounce search term (500ms)
  const debouncedSearch = useDebounce(searchTerm, 500);

  /**
   * 1. Lấy danh sách Jobs để hiển thị trong Select Filter và Form
   */
  useEffect(() => {
    const fetchJobs = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/items/job`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (handleAuthError(result)) return;
        if (res.ok) setJobs(result.data);
      } catch (e) {
        console.error("Fetch Jobs Error:", e);
      }
    };
    fetchJobs();
  }, [token, handleAuthError]);

  /**
   * 2. Hàm Fetch People
   */
  const fetchPeople = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);

      const params = new URLSearchParams({
        fields: "*,job.*",
        limit: limit.toString(),
        page: page.toString(),
        meta: "filter_count",
      });

      const filters: any = {};
      if (debouncedSearch) {
        filters.name = { _contains: debouncedSearch };
      }
      if (selectedJob && selectedJob !== "all") {
        filters.job = { id: { _eq: selectedJob } };
      }

      if (Object.keys(filters).length > 0) {
        params.append("filter", JSON.stringify(filters));
      }

      const res = await fetch(`${BASE_URL}/items/people?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (handleAuthError(result)) return;

      if (res.ok) {
        setPeople(result.data || []);
        setTotalCount(result.meta?.filter_count || 0);
      }
    } catch (error) {
      console.error("Fetch People Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, selectedJob, limit, page, handleAuthError]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedJob, limit]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans flex relative">
      <Sidebar currentPath="/data" />

      <div className="flex-1 lg:ml-64 pb-32">
        <main className="pt-8 px-4 md:px-8 max-w-7xl mx-auto">
          {/* HEADER & NÚT THÊM MỚI */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Danh sách nhân sự
              </h1>
              <p className="text-sm text-slate-500">
                Quản lý thông tin thành viên và nghề nghiệp
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <Plus size={20} />
              Thêm mới
            </button>
          </div>

          {/* BỘ LỌC TÌM KIẾM */}
          <section className="mb-8">
            <div className="bg-white rounded-3xl md:rounded-full p-2 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-2">
              <div className="relative flex-grow w-full">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  className="w-full bg-slate-50 border-none rounded-full py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Tìm kiếm tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative w-full md:w-64">
                <Briefcase
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <select
                  className="w-full bg-slate-50 border-none rounded-full py-3 pl-11 pr-10 text-sm appearance-none font-medium text-slate-600 cursor-pointer outline-none"
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="all">Tất cả nghề nghiệp</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>
          </section>

          {/* BẢNG DỮ LIỆU */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-slate-400 text-sm animate-pulse">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400">
                      Thành viên
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400">
                      Công việc
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400 text-center">
                      Tuổi
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase text-slate-400">
                      Mô tả
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {people.length > 0 ? (
                    people.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                            <UserIcon size={20} />
                          </div>
                          <span className="font-bold text-slate-700">
                            {p.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {p.job?.image && (
                              <img
                                src={`${BASE_URL}/assets/${p.job.image}`}
                                className="w-8 h-8 rounded-lg object-cover shadow-sm"
                                alt=""
                              />
                            )}
                            <span className="text-sm font-semibold text-blue-600 bg-blue-50/50 px-2 py-1 rounded-md">
                              {p.job?.name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-500">
                          {p.age}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 max-w-xs line-clamp-2">
                          {p.job?.description}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-20 text-slate-400"
                      >
                        Không tìm thấy kết quả nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PHÂN TRANG */}
          <footer className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[10px] font-bold uppercase">
                Hiển thị
              </span>
              <select
                className="bg-white border border-slate-200 rounded-full px-4 py-1 text-xs font-bold outline-none focus:border-blue-500"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <span className="text-slate-400 text-xs">
                trong tổng số {totalCount} bản ghi
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-full border bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="bg-white border rounded-full px-4 py-1.5 shadow-sm">
                <span className="text-sm font-bold text-slate-700">
                  Trang {page} / {totalPages || 1}
                </span>
              </div>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-full border bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* MODAL THÊM MỚI (CHỈ GIAO DIỆN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Thêm nhân sự mới
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {/* Field Tên */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-4">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên nhân sự..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-4">
                    Tuổi
                  </label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    placeholder="25"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-4">
                    Nghề nghiệp
                  </label>
                  <div className="relative">
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-5 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all cursor-pointer">
                      <option value="">Chọn nghề nghiệp</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Lưu dữ liệu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Data;
