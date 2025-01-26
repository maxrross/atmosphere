'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const techStack = [
  { 
    name: 'Next.js', 
    logo: 'https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png'
  },
  { 
    name: 'TypeScript', 
    logo: 'https://raw.githubusercontent.com/microsoft/TypeScript-Website/v2/packages/typescriptlang-org/static/branding/ts-logo-512.svg'
  },
  { 
    name: 'TailwindCSS', 
    logo: 'https://seeklogo.com/images/T/tailwind-css-logo-5AD4175897-seeklogo.com.png'
  },
  { 
    name: 'TensorFlow', 
    logo: 'https://www.tensorflow.org/images/tf_logo_social.png'
  },
  { 
    name: 'Google Cloud', 
    logo: 'https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg'
  },
  { 
    name: 'Framer Motion', 
    logo: 'https://seeklogo.com/images/F/framer-motion-logo-DA1E33CAA1-seeklogo.com.png'
  }
];

export function TechStack() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {techStack.map((tech, index) => (
        <motion.div
          key={tech.name}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-16 h-16 relative mb-2">
            <Image
              src={tech.logo}
              alt={tech.name}
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
          <span className="text-sm font-medium text-slate-700">{tech.name}</span>
        </motion.div>
      ))}
    </div>
  );
} 