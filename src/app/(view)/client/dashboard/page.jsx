export default function ClientDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-800">Mon Tableau de Bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm">Collectes prévues</span>
          <span className="text-2xl font-bold text-green-600">2</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm">Notifications</span>
          <span className="text-2xl font-bold text-blue-600">5</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm">Bacs à proximité</span>
          <span className="text-2xl font-bold text-orange-600">3</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-gray-500 text-sm">Points fidélité</span>
          <span className="text-2xl font-bold text-purple-600">120</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-75 flex flex-center items-center justify-center text-gray-400">
        <p>Historique des collectes et activités à venir</p>
      </div>
    </div>
  );
}
