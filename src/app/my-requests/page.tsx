"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  MapPin,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";

type AidRequest = {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected";
  category: string;
  amount: number;
  funded: number;
  location: string;
  date: string;
  imageUrl?: string;
};

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockData: AidRequest[] = [
          {
            id: "req-001",
            title: "Emergency Food Supplies",
            status: "approved",
            category: "Food",
            amount: 2500,
            funded: 1800,
            location: "Lagos, Nigeria",
            date: "2023-10-15",
            // imageUrl: '/food-aid.jpg'
          },
          {
            id: "req-002",
            title: "Medical Equipment",
            status: "pending",
            category: "Health",
            amount: 5000,
            funded: 1200,
            location: "Nairobi, Kenya",
            date: "2023-10-18",
          },
          {
            id: "req-003",
            title: "School Renovation",
            status: "rejected",
            category: "Education",
            amount: 8000,
            funded: 0,
            location: "Accra, Ghana",
            date: "2023-09-28",
          },
          {
            id: "req-004",
            title: "Flood Relief",
            status: "approved",
            category: "Emergency",
            amount: 10000,
            funded: 7500,
            location: "Dakar, Senegal",
            date: "2023-10-05",
            // imageUrl: '/flood-relief.jpg'
          },
        ];

        setRequests(mockData);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = (funded: number, amount: number) => {
    return Math.min(Math.round((funded / amount) * 100), 100);
  };

  const toggleExpand = (id: string) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-400" />
            My Aid Requests
          </h1>
          <p className="text-gray-400">
            View and manage all your submitted aid requests
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-gray-800 rounded-xl p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Requests</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-xl p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
              <Filter className="text-gray-400" />
              <select
                className="bg-transparent focus:outline-none text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300">
              No requests found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => router.push("/submit-aid")}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Submit New Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 transition-all duration-200 hover:border-gray-600"
              >
                <div
                  className="p-4 sm:p-6 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleExpand(request.id)}
                >
                  <div className="flex items-center gap-4">
                    {request.imageUrl && (
                      <div className="hidden sm:block relative h-16 w-16 rounded-lg overflow-hidden">
                        <Image
                          src={request.imageUrl}
                          alt={request.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{request.title}</h3>
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {request.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {request.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {request.funded.toLocaleString()} /{" "}
                          {request.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {expandedRequest === request.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {expandedRequest === request.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 text-gray-300">
                          Funding Progress
                        </h4>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{
                              width: `${getProgressPercentage(
                                request.funded,
                                request.amount
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          {getProgressPercentage(
                            request.funded,
                            request.amount
                          )}
                          % funded
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-gray-300">
                          Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">Status</p>
                            <p className="capitalize">{request.status}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Date Submitted</p>
                            <p>{new Date(request.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Category</p>
                            <p>{request.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Location</p>
                            <p>{request.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg">
                        View Details
                      </button>
                      <button className="text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg">
                        Share Request
                      </button>
                      {request.status === "pending" && (
                        <button className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg">
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
