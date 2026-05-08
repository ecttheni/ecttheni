"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User, Settings, FolderOpen, Image as ImageIcon,
  LogOut, Bell, Calendar, ChevronRight, Loader2,
  Edit, Shield, Star
} from "lucide-react";
import Link from "next/link";
import { getMemberById, updateMemberProfile, changePassword, addProject, deleteProject, addGalleryItem, deleteGalleryItem } from "@/lib/actions/members";
import { getEvents, bookEvent, checkBooking } from "@/lib/actions/events";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Check } from "lucide-react";
import { compressImage } from "@/lib/compress";

const sidebarItems = [
  { label: "My Profile", href: "#profile", icon: User },
  { label: "My Projects", href: "#projects", icon: FolderOpen },
  { label: "My Gallery", href: "#gallery", icon: ImageIcon },
  { label: "Events", href: "#events", icon: Calendar },
  { label: "Settings", href: "#settings", icon: Settings },
];

export default function MemberDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingGallery, setIsAddingGallery] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    designation: "",
    company: "",
    companyAddress: "",
    mobile: "",
    dateOfBirth: "",
    dateOfAnniversary: "",
    aboutUs: "",
    location: "",
    experience: "",
    skills: "",
    workingPlaces: "",
    additionalBusiness: "",
    requirements: "",
    instagramUrl: "",
    facebookUrl: "",
    photoUrl: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    photoUrl: "",
  });

  const [galleryForm, setGalleryForm] = useState({
    imageUrl: "",
  });

  const [compressedProfilePhoto, setCompressedProfilePhoto] = useState<File | null>(null);
  const [compressedProjectPhoto, setCompressedProjectPhoto] = useState<File | null>(null);
  const [compressedGalleryPhoto, setCompressedGalleryPhoto] = useState<File | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

   // Load member data
   useEffect(() => {
     if (session?.user?.id) {
       loadData();
     }
   }, [session]);

   // Handle event booking
   const handleToggleBooking = async (eventId: string) => {
     if (!session?.user?.id) return;

     const eventIndex = events.findIndex((e: any) => e.id === eventId);
     if (eventIndex === -1) return;

     // Update optimistic state
     const updatedEvents = [...events];
     updatedEvents[eventIndex] = {
       ...updatedEvents[eventIndex],
       isBooking: true,
     };
     setEvents(updatedEvents);

     try {
       const res = await bookEvent(eventId, session.user.id as string);
       if (res.success) {
         // Toggle booked status optimistically
         updatedEvents[eventIndex] = {
           ...updatedEvents[eventIndex],
           isBooked: res.booked,
           isBooking: false,
         };
         setEvents(updatedEvents);
         toast.success(res.message as string);
       } else {
         throw new Error((res.error as string) || "Failed to book event");
       }
     } catch (error: any) {
       // Revert on error
       updatedEvents[eventIndex] = {
         ...updatedEvents[eventIndex],
         isBooking: false,
       };
       setEvents(updatedEvents);
       toast.error(error.message || "Failed to book event");
     }
   };

   const loadData = async () => {
     setLoading(true);
     const [memberRes, eventsRes] = await Promise.all([
       getMemberById(session?.user?.id as string),
       getEvents(),
     ]);

     if (memberRes.success && memberRes.data) {
       setMember(memberRes.data);
       const d = memberRes.data.memberDetails;
       setProfileForm({
         fullName: d?.fullName || "",
         designation: d?.designation || "",
         company: d?.company || "",
         companyAddress: d?.companyAddress || "",
         mobile: d?.mobile || "",
         dateOfBirth: d?.dateOfBirth ? format(new Date(d.dateOfBirth), "yyyy-MM-dd") : "",
         dateOfAnniversary: d?.dateOfAnniversary ? format(new Date(d.dateOfAnniversary), "yyyy-MM-dd") : "",
         aboutUs: d?.aboutUs || "",
         location: d?.location || "",
         experience: d?.experience || "",
         skills: d?.skills || "",
         workingPlaces: d?.workingPlaces || "",
         additionalBusiness: d?.additionalBusiness || "",
         requirements: d?.requirements || "",
         instagramUrl: d?.instagramUrl || "",
         facebookUrl: d?.facebookUrl || "",
         photoUrl: d?.photoUrl || "",
       });
     }
     
     // Process events with booking status
     if (eventsRes.success) {
       const eventsWithStatus = await Promise.all(
         (eventsRes.data || []).map(async (event: any) => {
           const bookingRes = await checkBooking(event.id, session?.user?.id as string);
           return {
             ...event,
             isBooked: bookingRes.success && bookingRes.booked,
             isBooking: false,
           };
         })
       );
       setEvents(eventsWithStatus.slice(0, 5));
     }
     setLoading(false);
   };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", profileForm.fullName);
    formData.append("designation", profileForm.designation);
    formData.append("company", profileForm.company);
    formData.append("companyAddress", profileForm.companyAddress);
    formData.append("mobile", profileForm.mobile);
    formData.append("dateOfBirth", profileForm.dateOfBirth);
    formData.append("dateOfAnniversary", profileForm.dateOfAnniversary);
    formData.append("aboutUs", profileForm.aboutUs);
    formData.append("location", profileForm.location);
    formData.append("experience", profileForm.experience);
    formData.append("skills", profileForm.skills);
    formData.append("workingPlaces", profileForm.workingPlaces);
    formData.append("additionalBusiness", profileForm.additionalBusiness);
    formData.append("requirements", profileForm.requirements);
    formData.append("instagramUrl", profileForm.instagramUrl);
    formData.append("facebookUrl", profileForm.facebookUrl);
    formData.append("photoUrl", profileForm.photoUrl);
    if (compressedProfilePhoto) formData.append("photo", compressedProfilePhoto);

    const res = await updateMemberProfile(session?.user?.id as string, formData);
    if (res.success) {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setCompressedProfilePhoto(null);
      loadData();
    } else {
      toast.error(res.error || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("currentPassword", passwordForm.currentPassword);
    formData.append("newPassword", passwordForm.newPassword);

    const res = await changePassword(session?.user?.id as string, formData);
    if (res.success) {
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
    } else {
      toast.error(res.error || "Failed to change password");
    }
  };

   const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if already at limit of 4 projects
    if (details?.projects?.length >= 4) {
      toast.error("You can only add up to 4 projects");
      return;
    }
    
    const formData = new FormData();
    formData.append("name", projectForm.name);
    formData.append("description", projectForm.description);
    if (compressedProjectPhoto) formData.append("photo", compressedProjectPhoto);

    const res = await addProject(member.memberDetails.id, formData);
    if (res.success) {
      toast.success("Project added successfully!");
      setProjectForm({ name: "", description: "", photoUrl: "" });
      setCompressedProjectPhoto(null);
      setIsAddingProject(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to add project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await deleteProject(id);
    if (res.success) {
      toast.success("Project deleted");
      loadData();
    } else {
      toast.error("Failed to delete project");
    }
  };

   const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if already at limit of 6 gallery items
    if (details?.gallery?.length >= 6) {
      toast.error("You can only add up to 6 gallery photos");
      return;
    }
    
    const formData = new FormData();
    if (compressedGalleryPhoto) formData.append("photo", compressedGalleryPhoto);

    const res = await addGalleryItem(member.memberDetails.id, formData);
    if (res.success) {
      toast.success("Photo added successfully!");
      setGalleryForm({ imageUrl: "" });
      setCompressedGalleryPhoto(null);
      setIsAddingGallery(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to add photo");
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    const res = await deleteGalleryItem(id);
    if (res.success) {
      toast.success("Photo deleted");
      loadData();
    } else {
      toast.error("Failed to delete photo");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  if (!session) return null;

  const details = member?.memberDetails;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border fixed inset-y-0 left-0 z-40 flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-lg shadow shadow-brand-blue/30">
              E
            </div>
            <div>
              <div className="text-sm font-bold text-brand-dark leading-none">ECT THENI</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Member Portal</div>
            </div>
          </Link>
        </div>

        {/* Profile snippet */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3 p-3 bg-brand-blue/5 rounded-2xl">
            <div className="w-10 h-10 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue font-bold text-lg shrink-0">
              {details?.fullName?.charAt(0) || session.user?.email?.charAt(0)?.toUpperCase() || "M"}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-brand-dark text-sm truncate">{details?.fullName || "Member"}</div>
              <div className="text-[11px] text-muted-foreground truncate">{session.user?.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.href.replace("#", ""))}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === item.href.replace("#", "")
                  ? "bg-brand-blue text-white shadow shadow-brand-blue/20"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-brand-dark"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-brand-dark">
                Welcome, {details?.fullName?.split(" ")[0] || "Member"}! 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <button className="relative p-3 bg-white border border-border rounded-2xl text-muted-foreground hover:text-brand-blue hover:border-brand-blue transition-all">
              <Bell size={20} />
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Member Card */}
              <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-brand-blue via-blue-500 to-blue-400" />
                <div className="px-8 pb-8">
                  <div className="flex items-end justify-between -mt-10 mb-6">
                    <div className="w-20 h-20 bg-white border-4 border-white rounded-full shadow flex items-center justify-center text-brand-blue font-bold text-2xl overflow-hidden">
                      {details?.photoUrl ? (
                        <img src={details.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        details?.fullName?.charAt(0) || "M"
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-xl text-sm font-semibold hover:bg-brand-blue/20 transition-all"
                    >
                      {isEditing ? <X size={14} /> : <Edit size={14} />}
                      <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                          <input type="text" name="fullName" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Designation</label>
                          <input type="text" name="designation" value={profileForm.designation} onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Mobile Number</label>
                          <input type="tel" name="mobile" value={profileForm.mobile} onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Company Name</label>
                          <input type="text" name="company" value={profileForm.company} onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Company Address</label>
                          <input type="text" name="companyAddress" value={profileForm.companyAddress} onChange={(e) => setProfileForm({ ...profileForm, companyAddress: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Date of Birth</label>
                          <input type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Date of Anniversary</label>
                          <input type="date" name="dateOfAnniversary" value={profileForm.dateOfAnniversary} onChange={(e) => setProfileForm({ ...profileForm, dateOfAnniversary: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Location</label>
                          <input type="text" name="location" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Working Places</label>
                          <input type="text" name="workingPlaces" value={profileForm.workingPlaces} onChange={(e) => setProfileForm({ ...profileForm, workingPlaces: e.target.value })} placeholder="e.g. Chennai, Theni, Madurai" className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Additional Business</label>
                          <input type="text" name="additionalBusiness" value={profileForm.additionalBusiness} onChange={(e) => setProfileForm({ ...profileForm, additionalBusiness: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Requirements</label>
                          <input type="text" name="requirements" value={profileForm.requirements} onChange={(e) => setProfileForm({ ...profileForm, requirements: e.target.value })} placeholder="e.g. Looking for project partners" className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Instagram URL</label>
                          <input type="url" name="instagramUrl" value={profileForm.instagramUrl} onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })} placeholder="https://instagram.com/..." className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Facebook URL</label>
                          <input type="url" name="facebookUrl" value={profileForm.facebookUrl} onChange={(e) => setProfileForm({ ...profileForm, facebookUrl: e.target.value })} placeholder="https://facebook.com/..." className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Experience</label>
                          <input type="text" name="experience" value={profileForm.experience} onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Profile Photo</label>
                          <input type="file" name="photo" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const compressed = await compressImage(file); setCompressedProfilePhoto(compressed); } }} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-brand-dark outline-none focus:border-brand-blue" />
                          <p className="text-xs text-muted-foreground mt-1">Images larger than 1 MB will be auto-compressed.</p>
                          <input type="hidden" name="photoUrl" value={profileForm.photoUrl} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">About Us</label>
                        <textarea name="aboutUs" value={profileForm.aboutUs} onChange={(e) => setProfileForm({ ...profileForm, aboutUs: e.target.value })} rows={3} placeholder="Tell us about yourself, your background, and interests..." className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue resize-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Skills (comma separated)</label>
                        <textarea name="skills" value={profileForm.skills} onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })} rows={2} className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-foreground outline-none focus:border-brand-blue resize-none" />
                      </div>
                      <button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-blue/90 transition-all">Save Changes</button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-extrabold text-brand-dark">{details?.fullName || "Member"}</h2>
                          <p className="text-brand-blue font-semibold mt-1">{details?.designation || "Civil Engineer"}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <InfoRow label="Company" value={details?.company || "\u2014"} />
                        <InfoRow label="Company Address" value={details?.companyAddress || "\u2014"} />
                        <InfoRow label="Mobile" value={details?.mobile || "\u2014"} />
                        <InfoRow label="Date of Birth" value={details?.dateOfBirth ? format(new Date(details.dateOfBirth), "PPP") : "\u2014"} />
                        <InfoRow label="Anniversary" value={details?.dateOfAnniversary ? format(new Date(details.dateOfAnniversary), "PPP") : "\u2014"} />
                        <InfoRow label="Location" value={details?.location || "\u2014"} />
                        <InfoRow label="Working Places" value={details?.workingPlaces || "\u2014"} />
                        <InfoRow label="Additional Business" value={details?.additionalBusiness || "\u2014"} />
                        <InfoRow label="Requirements" value={details?.requirements || "\u2014"} />
                        {details?.instagramUrl && (
                          <div className="flex flex-col space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Instagram</span>
                            <a href={details.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-blue hover:underline truncate">View Profile</a>
                          </div>
                        )}
                        {details?.facebookUrl && (
                          <div className="flex flex-col space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Facebook</span>
                            <a href={details.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-blue hover:underline truncate">View Profile</a>
                          </div>
                        )}
                        <InfoRow label="Experience" value={details?.experience || "\u2014"} />
                        <InfoRow label="Member Since" value={member?.entryYear?.toString() || "\u2014"} />
                        <InfoRow label="Email" value={session.user?.email || "\u2014"} />
                      </div>

                      {details?.aboutUs && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">About</h3>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{details.aboutUs}</p>
                        </div>
                      )}

                      {details?.skills && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Skills & Expertise</h3>
                          <div className="flex flex-wrap gap-2">
                            {details.skills.split(",").map((s: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-semibold">{s.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Projects", value: details?.projects?.length ?? 0, icon: FolderOpen, color: "bg-blue-50 text-blue-600" },
                  { label: "Gallery Photos", value: details?.gallery?.length ?? 0, icon: ImageIcon, color: "bg-purple-50 text-purple-600" },
                  { label: "Events Attended", value: 0, icon: Calendar, color: "bg-amber-50 text-amber-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-3xl border border-border p-6 flex items-center space-x-4 shadow-sm">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
                      <s.icon size={22} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-brand-dark">{s.value}</div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

           {/* Events Tab */}
           {activeTab === "events" && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
               <h2 className="text-xl font-bold text-brand-dark">Upcoming Events</h2>
               {events.length === 0 ? (
                 <div className="bg-white rounded-3xl border border-dashed border-border p-16 text-center">
                   <Calendar size={40} className="text-muted-foreground mx-auto mb-3" />
                   <p className="text-muted-foreground">No upcoming events at the moment.</p>
                 </div>
               ) : (
                 events.map((event) => (
                   <div key={event.id} className="bg-white rounded-3xl border border-border p-6 flex items-center space-x-5 shadow-sm hover:shadow-md transition-all">
                     <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex flex-col items-center justify-center text-brand-blue shrink-0">
                       <span className="text-xs font-bold uppercase">{format(new Date(event.date), "MMM")}</span>
                       <span className="text-xl font-extrabold leading-none">{format(new Date(event.date), "dd")}</span>
                     </div>
                     <div className="flex-1">
                       <h3 className="font-bold text-brand-dark">{event.title}</h3>
                       {event.description && (
                         <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{event.description}</p>
                       )}
                     </div>
                     <div className="flex items-center space-x-4 mt-3">
                       <button
                         onClick={() => handleToggleBooking(event.id)}
                         className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                           event.isBooked
                             ? "bg-red-50 text-red-600 hover:bg-red-100"
                             : "bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20"
                         }`}
                       >
                         {event.isBooking ? (
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                           <Check className="mr-2 h-4 w-4" />
                         )}
                         <span>{event.isBooked ? "Booked" : "Book Event"}</span>
                       </button>
                     </div>
                   </div>
                 ))
               )}
             </motion.div>
           )}

          {activeTab === "projects" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-brand-dark">My Projects</h2>
                <button
                  onClick={() => setIsAddingProject(!isAddingProject)}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-blue/90 transition-all"
                >
                  {isAddingProject ? <X size={16} /> : <Plus size={16} />}
                  <span>{isAddingProject ? "Cancel" : "Add Project"}</span>
                </button>
              </div>

              {isAddingProject && (
                <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                  <form onSubmit={handleAddProject} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Project Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={projectForm.name}
                          onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-brand-dark outline-none focus:border-brand-blue"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Project Photo</label>
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const compressed = await compressImage(file);
                              setCompressedProjectPhoto(compressed);
                            }
                          }}
                          className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-brand-dark outline-none focus:border-brand-blue"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Images larger than 1 MB will be auto-compressed.</p>
                     </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                      <textarea
                        name="description"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-brand-dark outline-none focus:border-brand-blue resize-none"
                      />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-blue/90 transition-all">
                      Save Project
                    </button>
                  </form>
                </div>
              )}

               <div className="grid md:grid-cols-2 gap-4">
                 {details?.projects?.length === 0 ? (
                   <div className="col-span-2 bg-white rounded-3xl border border-dashed border-border p-12 text-center">
                     <FolderOpen size={40} className="text-muted-foreground mx-auto mb-3" />
                     <p className="text-muted-foreground">No projects added yet.</p>
                   </div>
                 ) : (
                   details?.projects?.slice(0, 3).map((project: any) => (
                     <div key={project.id} className="bg-white rounded-3xl border border-border p-5 shadow-sm group relative">
                       <button
                         onClick={() => handleDeleteProject(project.id)}
                         className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                       >
                         <Trash2 size={16} />
                       </button>
                       {project.photoUrl && (
                         <img src={project.photoUrl} alt="" className="w-full h-32 object-cover rounded-2xl mb-4" />
                       )}
                       <h3 className="font-bold text-brand-dark">{project.name}</h3>
                       <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{project.description}</p>
                     </div>
                   ))
                 )}
               </div>
            </motion.div>
          )}

          {activeTab === "gallery" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-brand-dark">My Gallery</h2>
                <button
                  onClick={() => setIsAddingGallery(!isAddingGallery)}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-blue/90 transition-all"
                >
                  {isAddingGallery ? <X size={16} /> : <Plus size={16} />}
                  <span>{isAddingGallery ? "Cancel" : "Add Photo"}</span>
                </button>
              </div>

              {isAddingGallery && (
                <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                  <form onSubmit={handleAddGallery} className="space-y-4">
                       <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Upload Photo</label>
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          required
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const compressed = await compressImage(file);
                              setCompressedGalleryPhoto(compressed);
                            }
                          }}
                          className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm text-brand-dark outline-none focus:border-brand-blue"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Images larger than 1 MB will be auto-compressed.</p>
                     </div>
                    <button type="submit" className="px-6 py-2 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-blue/90 transition-all">
                      Add to Gallery
                    </button>
                  </form>
                </div>
              )}

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {details?.gallery?.length === 0 ? (
                   <div className="col-span-4 bg-white rounded-3xl border border-dashed border-border p-12 text-center">
                     <ImageIcon size={40} className="text-muted-foreground mx-auto mb-3" />
                     <p className="text-muted-foreground">No gallery photos yet.</p>
                   </div>
                 ) : (
                   details?.gallery?.slice(0, 6).map((img: any) => (
                     <div key={img.id} className="aspect-square bg-white rounded-2xl border border-border overflow-hidden group relative">
                       <img src={img.imageUrl} alt="" className="w-full h-full object-cover transition-all group-hover:scale-105" />
                       <button
                         onClick={() => handleDeleteGallery(img.id)}
                         className="absolute top-2 right-2 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                       >
                         <Trash2 size={14} />
                       </button>
                     </div>
                   ))
                 )}
               </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-brand-dark">Account Settings</h2>
              <div className="bg-white rounded-[2.5rem] border border-border p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="font-bold text-brand-dark mb-1">Change Password</h3>
                  <p className="text-muted-foreground text-sm mb-4">Update your account password.</p>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                    <input
                      type="password"
                      required
                      placeholder="Current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-brand-dark outline-none focus:border-brand-blue"
                    />
                    <input
                      type="password"
                      required
                      placeholder="New password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-brand-dark outline-none focus:border-brand-blue"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-brand-dark outline-none focus:border-brand-blue"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-blue/90 transition-all"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col space-y-0.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-brand-dark"}`}>{value}</span>
    </div>
  );
}
