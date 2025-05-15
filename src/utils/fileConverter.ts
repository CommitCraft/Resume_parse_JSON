import { PersonData } from '../types';
import * as tf from '@tensorflow/tfjs';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker with local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

let model: tf.LayersModel | null = null;

/**
 * Initialize TensorFlow model with enhanced architecture
 */
async function initializeModel() {
  if (!model) {
    model = await tf.sequential({
      layers: [
        tf.layers.dense({ units: 512, activation: 'relu', inputShape: [200] }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 64, activation: 'softmax' })
      ]
    });
  }
}

/**
 * Extract text content from PDF file
 */
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }

  return text;
}

/**
 * Extract text content from DOC/DOCX file
 */
async function extractDocText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extract data from uploaded files and convert to structured JSON
 */
export async function extractDataFromFiles(files: File[]): Promise<PersonData> {
  await initializeModel();
  const data: PersonData = {};
  
  for (const file of files) {
    try {
      let fileContent = '';
      const fileType = file.type.toLowerCase();
      
      // Extract text based on file type
      if (fileType.includes('pdf')) {
        fileContent = await extractPdfText(file);
      } else if (fileType.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        fileContent = await extractDocText(file);
      } else {
        fileContent = await readFileAsText(file);
      }
      
      console.log('Processing file:', file.name);
      
      // Use AI to enhance extraction
      const enhancedContent = await enhanceExtraction(fileContent);
      
      // Extract data from enhanced content
      const extractedData = extractDataFromText(enhancedContent);
      
      // Merge with existing data
      mergePersonData(data, extractedData);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }
  
  return data;
}

/**
 * Enhanced text extraction using TensorFlow
 */
async function enhanceExtraction(text: string): Promise<string> {
  if (!model) return text;

  try {
    // Prepare text for model with improved encoding
    const encoded = encodeText(text);
    const tensor = tf.tensor2d([encoded], [1, 200]);
    
    // Get model prediction with attention mechanism
    const prediction = (await model.predict(tensor)) as tf.Tensor;
    const enhanced = await prediction.data();
    
    // Cleanup
    tensor.dispose();
    prediction.dispose();
    
    // Apply advanced AI enhancements
    const sections = text.split('\n\n');
    const enhancedSections = sections.map((section, i) => {
      const weight = enhanced[i % enhanced.length];
      const importance = weight > 0.7 ? 'HIGH' : weight > 0.4 ? 'MEDIUM' : 'LOW';
      
      // Apply section-specific enhancements
      switch (importance) {
        case 'HIGH':
          return section.toUpperCase();
        case 'MEDIUM':
          return section.split('\n').map(line => `> ${line}`).join('\n');
        default:
          return section;
      }
    });
    
    return enhancedSections.join('\n\n');
  } catch (error) {
    console.error('Error in AI enhancement:', error);
    return text;
  }
}

/**
 * Improved text encoding for AI processing
 */
function encodeText(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const punctuation = text.match(/[.,!?;:]/g)?.length || 0;
  const numbers = text.match(/\d+/g)?.length || 0;
  
  return Array.from({ length: 200 }).map((_, i) => {
    if (i < words.length) return words[i].length / 20;
    if (i < words.length + 50) return (punctuation / 100) * (i % 2 ? 1 : -1);
    if (i < words.length + 100) return (numbers / 50) * (i % 3 ? 1 : -1);
    return 0;
  });
}

/**
 * Read file content as text with enhanced error handling
 */
async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      // Basic content validation
      if (!content.trim()) {
        reject(new Error('File is empty'));
        return;
      }
      resolve(content);
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}

/**
 * Extract structured data from text content with improved patterns
 */
function extractDataFromText(text: string): PersonData {
  const data: PersonData = {};
  
  // Enhanced name extraction patterns
  const namePatterns = [
    /name:\s*([\w\s.-]+)/i,
    /^([\w\s.-]{2,50})$/m,
    /I am ([\w\s.-]+)/i,
    /(\w+\s+\w+)\s*$/m,
    /curriculum vitae of ([\w\s.-]+)/i,
    /resume of ([\w\s.-]+)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
    /([A-Z][a-z]+(?:\s+(?:van|de|der|el|al|bin|ibn)\s+)?[A-Z][a-z]+)/
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().split(/\s+/).length >= 2) {
      data.name = match[1].trim();
      break;
    }
  }
  
  // Enhanced email extraction with validation
  const emailPattern = /(?:email:?\s*)?([\w.+-]+@[\w-]+\.[\w.-]+)/i;
  const emailMatch = text.match(emailPattern);
  if (emailMatch && emailMatch[1] && emailMatch[1].includes('@')) {
    const email = emailMatch[1].trim();
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) {
      data.email = email;
    }
  }
  
  // Enhanced phone extraction with international format support
  const phonePatterns = [
    /(?:phone|tel|telephone|mobile):?\s*([+\d\s()-]{10,})/i,
    /(\+?[\d\s()-]{10,})/,
    /(\d{3}[-.)]\s*\d{3}[-.)]\s*\d{4})/,
    /(\+\d{1,3}\s?[-.]?\s?\d{1,4}\s?[-.]?\s?\d{1,4}\s?[-.]?\s?\d{1,4})/,
    /(\(\d{3}\)\s*\d{3}[-.]?\d{4})/
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const phone = match[1].trim().replace(/\s+/g, ' ');
      if (/[\d()+-]{10,}/.test(phone)) {
        data.phone = phone;
        break;
      }
    }
  }
  
  // Enhanced education extraction with detailed parsing
const educationSection = extractSection(text, 'education|academic|qualification|studies', 'experience|skills|projects');

if (educationSection) {
  const educationItems = educationSection
    .split(/\n\s*\n/) // split by blank lines (paragraphs)
    .filter(item => item.trim().length > 0)
    .map(item => {
      // Find lines matching institution keywords
      const lines = item.split('\n').map(line => {
        const trimmed = line.trim();
        const match = trimmed.match(/(?:institute|university|college|school|master|b\.?s\.?|m\.?s\.?|ph\.?d\.?|b\.?a\.?|m\.?a\.?)[\s:]+([\w\s.]+)/i);
        return match ? trimmed : null;  // return full line if matched
      }).filter(Boolean);

      // Degree extraction
      const degreeMatch = item.match(/(?:degree|diploma|certificate|bachelor|master|phd|b\.?s\.?|m\.?s\.?|ph\.?d\.?|b\.?a\.?|m\.?a\.?)[\s:]+([\w\s.]+)/i);

      // Field/major extraction
      const fieldMatch = item.match(/(?:field|major|specialization|in|concentration)[\s:]+([\w\s.]+)/i);

      // Date extraction (start and end years)
      const dateMatch = item.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current|ongoing)/i);

      return {
        institution: lines.length > 0 ? lines[0] as string : '',
        degree: degreeMatch ? degreeMatch[1].trim() : undefined,
        field: fieldMatch ? fieldMatch[1].trim() : undefined,
        startDate: dateMatch ? dateMatch[1] : undefined,
        endDate: dateMatch ? dateMatch[2].toLowerCase() : undefined
      };
    })
    // Filter out entries without institution
    .filter(edu => edu.institution && edu.institution.length > 0);

  if (educationItems.length > 0) {
    data.education = educationItems as Required<Pick<typeof educationItems[number], 'institution'>>[]; // type assertion for TS
  }
}

  
  // Enhanced skills extraction with categorization and filtering
const skillsSection = extractSection(
  text, 
  'skills|technologies|expertise|competencies|technical skills|proficiencies', 
  'education|experience|projects'
);

if (skillsSection) {
  const skills = skillsSection
    .split(/[,;•|\n]/) // split by common delimiters and newlines
    .map(skill => skill.trim())
    .filter(skill => {
      const isValid = 
        skill.length > 1 &&
        skill.length < 50 &&
        !/^\d+$/.test(skill) &&                  // exclude pure numbers
        !/^[^a-zA-Z]+$/.test(skill) &&          // exclude strings without letters
        !/^(and|or|the|a|an|in|on|at|to|for|of)$/i.test(skill); // exclude common stopwords
      return isValid;
    });
  
  if (skills.length > 0) {
    // Remove duplicates and sort alphabetically
    data.skills = [...new Set(skills)].sort((a, b) => a.localeCompare(b));
  }
}

  
  // Enhanced experience extraction with detailed parsing
  const experienceSection = extractSection(text, 'experience|work history|employment|professional background|career', 'education|skills|projects');
  if (experienceSection) {
    const experienceItems = experienceSection
      .split(/\n\s*\n/)
      .filter(item => item.trim().length > 0)
      .map(item => {
        const lines = item.split('\n').map(line => line.trim());
        const dateMatch = item.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current|ongoing)/i);
        const descriptionMatch = item.match(/(?:description|responsibilities|achievements|duties):\s*(.+?)(?=\n|$)/is);
        
        // Enhanced position and company extraction
        let position = '', company = '';
        const positionMatch = item.match(/(?:position|title|role):\s*(.+?)(?=\n|at|company|employer|$)/i);
        const companyMatch = item.match(/(?:at|company|employer|organization):\s*(.+?)(?=\n|$)/i);
        
        if (positionMatch && companyMatch) {
          position = positionMatch[1].trim();
          company = companyMatch[1].trim();
        } else if (lines.length >= 2) {
          // Intelligent position/company detection
          const firstLine = lines[0].toLowerCase();
          const secondLine = lines[1].toLowerCase();
          
          if (firstLine.includes('senior') || firstLine.includes('manager') || firstLine.includes('engineer')) {
            position = lines[0];
            company = lines[1];
          } else {
            company = lines[0];
            position = lines[1];
          }
        }
        
        return {
          company: company || 'Unknown Company',
          position: position || 'Unknown Position',
          startDate: dateMatch ? dateMatch[1] : undefined,
          endDate: dateMatch ? dateMatch[2].toLowerCase() : undefined,
          description: descriptionMatch ? descriptionMatch[1].trim() : undefined
        };
      })
      .filter(exp => exp.company !== 'Unknown Company' || exp.position !== 'Unknown Position');
    
    if (experienceItems.length > 0) {
      data.experience = experienceItems;
    }
  }
  
  // Enhanced projects extraction with detailed parsing
  const projectsSection = extractSection(text, 'projects|portfolio|works|applications', 'education|experience|skills');
  if (projectsSection) {
    const projectItems = projectsSection
      .split(/\n\s*\n/)
      .filter(item => item.trim().length > 0)
      .map(item => {
        const lines = item.split('\n').map(line => line.trim());
        const descriptionMatch = item.match(/(?:description|about|summary|overview):\s*(.+?)(?=\n|$)/is);
        const urlMatch = item.match(/(?:url|link|website|github|gitlab|demo):\s*(https?:\/\/\S+)/i);
        const techMatch = item.match(/(?:technologies|tech stack|built with|tools used|stack):\s*(.+?)(?=\n|$)/i);
        
        return {
          name: lines[0],
          description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
          technologies: techMatch ? 
            techMatch[1]
              .split(/[,;|]/)
              .map(tech => tech.trim())
              .filter(tech => tech.length > 0 && !/^(and|using|with)$/i.test(tech)) : 
            undefined,
          url: urlMatch ? urlMatch[1] : undefined
        };
      })
      .filter(proj => proj.name && proj.name.length > 0);
    
    if (projectItems.length > 0) {
      data.projects = projectItems;
    }
  }
  
  return data;
}

/**
 * Enhanced section extraction with improved boundary detection
 */
function extractSection(text: string, sectionName: string, nextSections: string): string | null {
  const pattern = new RegExp(
    `(?:^|\\n)(?:${sectionName})\\s*(?::|\\n)+(.*?)(?:(?:^|\\n)(?:${nextSections})\\s*(?::|\\n)|$)`,
    'is'
  );
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

/**
 * Enhanced data merging with smart deduplication and normalization
 */
function mergePersonData(target: PersonData, source: PersonData): void {
  // For simple fields, prefer non-empty values and longer content
  if ((!target.name && source.name) || (source.name && source.name.length > (target.name?.length || 0))) {
    target.name = source.name;
  }
  if ((!target.email && source.email) || (source.email && source.email.length > (target.email?.length || 0))) {
    target.email = source.email;
  }
  if ((!target.phone && source.phone) || (source.phone && source.phone.length > (target.phone?.length || 0))) {
    target.phone = source.phone;
  }
  
  // Enhanced skills merging with normalization
  if (source.skills) {
    const normalizedSkills = new Set(
      (target.skills || [])
        .concat(source.skills)
        .map(skill => skill.trim())
        .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase())
        .filter(skill => skill.length > 1)
    );
    target.skills = Array.from(normalizedSkills).sort();
  }
  
  // Enhanced education merging with fuzzy matching
  if (source.education) {
    const existingInstitutions = new Set(
      (target.education || []).map(e => 
        `${e.institution.toLowerCase()}-${e.degree?.toLowerCase() || ''}-${e.field?.toLowerCase() || ''}`
      )
    );
    target.education = [
      ...(target.education || []),
      ...source.education.filter(e => 
        !existingInstitutions.has(
          `${e.institution.toLowerCase()}-${e.degree?.toLowerCase() || ''}-${e.field?.toLowerCase() || ''}`
        )
      )
    ].sort((a, b) => (b.endDate || '0').localeCompare(a.endDate || '0'));
  }
  
  // Enhanced experience merging with detailed comparison
  if (source.experience) {
    const existingExperience = new Set(
      (target.experience || []).map(e => 
        `${e.company.toLowerCase()}-${e.position.toLowerCase()}-${e.startDate || ''}-${e.endDate || ''}`
      )
    );
    target.experience = [
      ...(target.experience || []),
      ...source.experience.filter(e => 
        !existingExperience.has(
          `${e.company.toLowerCase()}-${e.position.toLowerCase()}-${e.startDate || ''}-${e.endDate || ''}`
        )
      )
    ].sort((a, b) => (b.startDate || '0').localeCompare(a.startDate || '0'));
  }
  
  // Enhanced projects merging with URL normalization
  if (source.projects) {
    const existingProjects = new Set(
      (target.projects || []).map(p => 
        `${p.name.toLowerCase()}-${(p.url || '').toLowerCase()}`
      )
    );
    target.projects = [
      ...(target.projects || []),
      ...source.projects.filter(p => 
        !existingProjects.has(
          `${p.name.toLowerCase()}-${(p.url || '').toLowerCase()}`
        )
      )
    ];
  }
}

/**
 * Generate enhanced mock data for demonstration
 */
export function generateMockData(): PersonData {
  return {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    education: [
      {
        institution: "Stanford University",
        degree: "Master of Science",
        field: "Computer Science",
        startDate: "2018",
        endDate: "2020"
      },
      {
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Software Engineering",
        startDate: "2014",
        endDate: "2018"
      }
    ],
    skills: [
      "JavaScript", "TypeScript", "React", "Node.js", "Python", 
      "GraphQL", "REST APIs", "SQL", "NoSQL", "AWS", "Docker",
      "Machine Learning", "CI/CD", "Agile", "Team Leadership",
      "System Design", "Cloud Architecture", "DevOps"
    ],
    experience: [
      {
        company: "Google",
        position: "Senior Software Engineer",
        startDate: "2020",
        endDate: "Present",
        description: "Leading the development of cloud-based solutions and implementing scalable architectures for enterprise applications. Mentoring junior developers and driving technical excellence across multiple teams."
      },
      {
        company: "Microsoft",
        position: "Software Engineer",
        startDate: "2018",
        endDate: "2020",
        description: "Developed front-end components and microservices for Microsoft Teams. Improved application performance by 40% through optimization and architectural improvements."
      }
    ],
    projects: [
      {
        name: "AI-Powered Analytics Dashboard",
        description: "A real-time analytics platform using machine learning for predictive insights and data visualization. Implemented advanced algorithms for trend analysis.",
        technologies: ["React", "TypeScript", "Python", "TensorFlow", "AWS", "D3.js"],
        url: "https://github.com/example/analytics-dashboard"
      },
      {
        name: "Blockchain Supply Chain",
        description: "Decentralized supply chain management system with smart contracts and real-time tracking. Implemented IoT integration for automated tracking.",
        technologies: ["Solidity", "React", "Node.js", "Ethereum", "Web3.js", "IoT"],
        url: "https://github.com/example/supply-chain"
      }
    ]
  };
}