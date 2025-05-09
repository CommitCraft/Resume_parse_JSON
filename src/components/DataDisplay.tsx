import React from 'react';
import { PersonData } from '../types';
import { Briefcase, GraduationCap, Code, Sparkles, Phone, Mail, User, FileCode } from 'lucide-react';

interface DataDisplayProps {
  data: PersonData | null;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <h2 className="text-2xl font-bold text-white">
          {data.name || 'Unnamed Profile'}
        </h2>
        <div className="mt-2 flex flex-col sm:flex-row gap-4">
          {data.email && (
            <div className="flex items-center text-blue-100">
              <Mail className="h-4 w-4 mr-2" />
              <span>{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center text-blue-100">
              <Phone className="h-4 w-4 mr-2" />
              <span>{data.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 grid gap-6">
        {data.education && data.education.length > 0 && (
          <section>
            <div className="flex items-center mb-4">
              <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Education</h3>
            </div>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900">{edu.institution}</h4>
                  {edu.degree && (
                    <p className="text-gray-700">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                  )}
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.endDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section>
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
            </div>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between flex-wrap">
                    <h4 className="font-medium text-gray-900">{exp.position}</h4>
                    <span className="text-blue-600 font-medium">{exp.company}</span>
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {exp.startDate}{exp.startDate && exp.endDate ? ' - ' : ''}{exp.endDate || 'Present'}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.skills && data.skills.length > 0 && (
          <section>
            <div className="flex items-center mb-4">
              <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.projects && data.projects.length > 0 && (
          <section>
            <div className="flex items-center mb-4">
              <Code className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
            </div>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  {project.description && (
                    <p className="text-gray-700 mt-1">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.url && (
                    <a 
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                    >
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DataDisplay;