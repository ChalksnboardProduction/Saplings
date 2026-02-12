"use client";
import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";

export default function Home() {
  const [formData, setFormData] = useState({
    // ... no change to state
    studentName: "",
    class: "",
    parentName: "",
    phone: "",
    email: "",
    address: ""
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    // Validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setStatus("error");
      setMessage("Phone number must be exactly 10 digits.");
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setStatus("error");
      setMessage("Please enter a valid email address containing '@' and '.'");
      return;
    }

    try {
      // 1. Register Student
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: formData.studentName,
          studentClass: formData.class,
          parentName: formData.parentName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFormData({
          studentName: "",
          class: "",
          parentName: "",
          phone: "",
          email: "",
          address: ""
        });
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Banner Section - Full Width */}
      <div className="w-full relative mt-16 md:mt-24">
        <Image
          src="/gd_goenka_banner_3.jpg"
          alt="School Banner"
          width={1920}
          height={600}
          className="w-full h-auto object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-start pl-4 md:pl-8 lg:pl-12 bg-black/20">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider drop-shadow-xl text-left">
            Admission Open
          </h2>
        </div>
      </div>

      <main className="flex-grow py-12 px-4 sm:px-6 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Left Side - Video */}
          {/* Left Side - Admission Text */}
          <div className="flex flex-col h-full pt-0">
            {/* Video Player */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 bg-gray-100">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/s8BJYEB9wRU?autoplay=1&mute=1&loop=1&playlist=s8BJYEB9wRU"
                title="GD Goenka School Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="space-y-4 text-gray-700 leading-relaxed text-sm lg:text-base text-justify">
              <h2 className="text-3xl font-bold text-[#081349] mb-4">Admission Process</h2>
              <p>
                We are delighted that you are considering GD Goenka Public School, Dhanbad as the ideal CBSE school in Dhanbad for your child’s educational journey. Our admission process is thoughtfully structured to welcome students who resonate with our core values, contribute positively to our inclusive school culture, and demonstrate a genuine curiosity for learning. We look forward to partnering with you on this important journey.
              </p>
              <p>
                To begin the admission process, we invite parents to submit an online inquiry through our website. The easy-to-navigate inquiry form serves as the first step toward securing admission at one of Dhanbad’s leading CBSE schools.
              </p>
              <p>
                Parents are warmly encouraged to visit our campus for a guided school tour. This visit offers a firsthand experience of our state-of-the-art facilities, academic environment, and the vibrant culture that defines life at GD Goenka Public School, Dhanbad. Experiencing the campus in person helps families better understand our educational philosophy.
              </p>
              <p>
                After the successful submission of the online inquiry form, parents will receive an email containing a link to the detailed admission application. We request that all information regarding the student and family be filled in accurately and completely. Mandatory documents such as the child’s birth certificate, previous academic records, and relevant medical details must be uploaded as part of the application process.
              </p>
              <p>
                An interactive parent-student interaction is an integral part of our admissions procedure. This interaction allows us to better understand the child’s interests, strengths, and learning outlook, while also giving parents an opportunity to engage with our academic team.
              </p>
              <p>
                Following the interaction, our admissions team will communicate the outcome of the application through email or phone. Parents will be informed whether the application has been approved for the next stage of admission.
              </p>

            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            <div className="bg-[#081349] rounded-2xl p-6 sm:p-12 shadow-xl border border-gray-100">


              <div className="text-center mb-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                  Student Registration
                </h1>
                <p className="text-gray-200">
                  Join GD Goenka Public School, Dhanbad family. Please fill out the details below.
                </p>
              </div>

              {status === "success" ? (
                <div className="text-center p-8 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Registration Successful!</h3>
                  <p className="text-green-700">Thank you for applying. We will contact you shortly.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-6 text-sm font-medium text-green-700 hover:text-green-900 underline"
                  >
                    Register another student
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === "error" && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm mb-6">
                      {message}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Student Name */}
                    <div className="space-y-2">
                      <label htmlFor="studentName" className="text-sm font-medium text-white ml-1">Student Name</label>
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        placeholder="Enter student's full name"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                        required
                      />
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-2">
                      <label htmlFor="class" className="text-sm font-medium text-white ml-1">Class Applying For</label>
                      <select
                        id="class"
                        name="class"
                        value={formData.class}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all text-gray-900"
                        required
                      >
                        <option value="" disabled>Select Class</option>
                        <option value="nursery">Nursery</option>
                        <option value="kg">KG</option>
                        <option value="1">Class 1</option>
                        <option value="2">Class 2</option>
                        <option value="3">Class 3</option>
                        <option value="4">Class 4</option>
                        <option value="5">Class 5</option>
                        <option value="6">Class 6</option>
                        <option value="7">Class 7</option>
                        <option value="8">Class 8</option>
                        <option value="9">Class 9</option>
                        <option value="11">Class 11</option>
                      </select>
                    </div>
                  </div>

                  {/* Parents Name */}
                  <div className="space-y-2">
                    <label htmlFor="parentName" className="text-sm font-medium text-white ml-1">Parent's / Guardian's Name</label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="Enter parent's full name"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-white ml-1">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength={10}
                        pattern="\d{10}"
                        title="Phone number must be exactly 10 digits"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                        required
                      />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-white ml-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@domain.com"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium text-white ml-1">Residential Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Enter complete address"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-gray-400 text-gray-900 resize-none"
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-center text-gray-300 mt-6">
                    By submitting this form, you agree to our <a href="#" className="underline hover:text-indigo-600">Terms of Service</a> and <a href="#" className="underline hover:text-indigo-600">Privacy Policy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Admission Process Text Section */}
        {/* Video Section - Bottom */}
        <div className="mt-16 w-full max-w-5xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-[#081349] mb-2">Experience Excellence</h3>
            <p className="text-gray-600">
              Discover what makes GD Goenka Public School, Dhanbad a premier institution for your child's holistic development.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#081349] aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/s8BJYEB9wRU?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&loop=1&playlist=s8BJYEB9wRU&showinfo=0"
              title="GD Goenka Public School, Dhanbad Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
