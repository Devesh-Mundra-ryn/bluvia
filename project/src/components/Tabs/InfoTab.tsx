import React from 'react';
import { Info } from 'lucide-react';

const InfoTab: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Info className="h-8 w-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">About BLUVIA</h2>
        </div>

        <div className="space-y-6 text-gray-600 dark:text-gray-300">
          <section>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Our Mission</h3>
            <p>
              BLUVIA is dedicated to providing accurate, accessible water analysis data for Arizona's
              environmental researchers, agricultural professionals, and land developers. Our
              cutting-edge predictive modeling helps stakeholders make informed decisions about
              water usage and environmental protection.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Technology</h3>
            <p>
              Our water metal concentration predictions are powered by advanced machine learning
              models trained on extensive hydrological data from the Arizona Department of
              Environmental Quality. We combine historical water samples, geological surveys,
              and environmental data to provide accurate estimations of metal concentrations
              across the state.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Data Sources</h3>
            <p>
              We combine data from multiple organizations to maintain the most comprehensive
              and up-to-date water composition database in Arizona:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 dark:text-gray-400">
              <li>Arizona Department of Environmental Quality</li>
              <li>USGS Water Quality Data</li>
              <li>Environmental Protection Agency Records</li>
              <li>Academic Research Institutions</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InfoTab;