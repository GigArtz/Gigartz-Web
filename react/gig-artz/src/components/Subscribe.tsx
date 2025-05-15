import React from "react";

export default function Subscribe() {
  return (
    <div>
      {/* Subscribe Section */}
      <section className="bg-dark py-2 rounded-lg border border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto  mb-2 h-auto">
            <h2 className="text-xl font-bold text-gray-100">
              Become a freelancer
            </h2>
            <p className="text-gray-300 mt-2">
              Get the latest news and updates right in your inbox.
            </p>
          </div>
          
          <button className="btn-primary">
            Monetize
          </button>
        </div>
      </section>
    </div>
  );
}
