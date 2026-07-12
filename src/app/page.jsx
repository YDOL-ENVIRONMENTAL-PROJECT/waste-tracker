"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-10 py-6 shadow-sm bg-white z-50">        
        <h1 className="text-2xl font-bold text-green-600">  
          Waste Tracker
        </h1>

        <nav className="flex gap-8 text-gray-600 font-medium">
          <a href="#features">Fonctionnalités</a>
          <a href="#how">Comment ça marche</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="flex gap-4">
          <button onClick={() => {router.push('/connexion')}} className="hover:text-green-700 text-green-600 font-semibold cursor-pointer">
            Connexion
          </button>

          <button onClick={() => {router.push('/inscription')}} className="hover:bg-green-700 bg-green-600 text-white px-5 py-2 rounded-lg cursor-pointer">
            S'inscrire
          </button>
        </div>
      </header>


      {/* HERO */}
      <section className="flex flex-col items-center text-center py-32 px-6 bg-green-50">

        <h2 className="text-5xl font-bold text-gray-900 max-w-3xl">
          Une gestion intelligente de la collecte des déchets
        </h2>

        <p className="mt-6 text-lg text-gray-600 max-w-xl">
          Waste Tracker connecte le service de gestion des ordures et les
          citoyens afin d'améliorer l'efficacité de la collecte des déchets,
          d'optimiser les tournées et de garder les villes propres.
        </p>

        <div className="flex gap-6 mt-10">
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold">
            Commencer
          </button>

          <button className="border border-green-600 text-green-600 px-8 py-3 rounded-lg">
            En savoir plus
          </button>
        </div>

      </section>


      {/* FEATURES */}
      <section id="features" className="py-24 px-10">

        <h3 className="text-3xl font-bold text-center mb-16">
          Fonctionnalités principales
        </h3>

        <div className="grid md:grid-cols-3 gap-10">

          <div className="p-8 shadow rounded-xl">
            <h4 className="text-xl font-semibold mb-4 text-green-600">
              Gestion centralisée
            </h4>
            <p className="text-gray-600">
              La tour de contrôle pilote les opérations : planification des
              collectes, affectation des chauffeurs aux zones et suivi des
              activités en temps réel.
            </p>
          </div>

          <div className="p-8 shadow rounded-xl">
            <h4 className="text-xl font-semibold mb-4 text-green-600">
              Application pour chauffeurs
            </h4>
            <p className="text-gray-600">
              Les chauffeurs reçoivent leurs tournées, effectuent les collectes
              et mettent à jour le statut des opérations directement depuis
              l'application.
            </p>
          </div>

          <div className="p-8 shadow rounded-xl">
            <h4 className="text-xl font-semibold mb-4 text-green-600">
              Services pour les citoyens
            </h4>
            <p className="text-gray-600">
              Les usagers reçoivent des notifications de collecte, peuvent
              signaler un bac plein et accéder à des offres VIP pour des
              collectes programmées.
            </p>
          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-10 bg-gray-50">

        <h3 className="text-3xl font-bold text-center mb-16">
          Comment ça fonctionne
        </h3>

        <div className="grid md:grid-cols-3 gap-10 text-center">

          <div>
            <div className="text-4xl font-bold text-green-600 mb-4">1</div>
            <p className="text-gray-600">
              Les citoyens reçoivent des notifications de collecte et peuvent
              signaler un bac plein à la tour de contrôle.
            </p>
          </div>

          <div>
            <div className="text-4xl font-bold text-green-600 mb-4">2</div>
            <p className="text-gray-600">
              La tour de contrôle planifie les tournées et affecte les chauffeurs
              aux différentes zones de collecte.
            </p>
          </div>

          <div>
            <div className="text-4xl font-bold text-green-600 mb-4">3</div>
            <p className="text-gray-600">
              Les chauffeurs réalisent les collectes et mettent à jour le statut
              des opérations dans l'application.
            </p>
          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="py-24 text-center bg-green-600 text-white">

        <h3 className="text-3xl font-bold mb-6">
          Améliorons ensemble la gestion des déchets
        </h3>

        <button onClick={() => {router.push('/inscription')}} className="hover:text-green-700 bg-white text-green-600 px-8 py-3 rounded-lg font-semibold cursor-pointer">
          Créer un compte
        </button>

      </section>


      {/* FOOTER */}
      <footer id="contact" className="py-10 text-center text-gray-500">

        <p>© {new Date().getFullYear()} Waste Tracker</p>

      </footer>

    </main>
  );
}