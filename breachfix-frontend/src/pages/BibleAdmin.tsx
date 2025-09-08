import React, { useState, useEffect } from 'react';
import { useAllBibleAdminApi } from '../hooks/useApi';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Interfaces for the AllBibles admin API
interface User {
  _id: string;
  username: string;
  profile?: {
    displayName?: string;
  };
}

interface AllBiblePendingEdit {
  _id: string;
  languageCode: string;
  sourceCode: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  currentTextId?: {
    _id: string;
    text: string;
    sourceCode: string;
    chapter: number;
    verse: number;
    languageCode: string;
    bookNumber: number;
  };
  suggestion?: string;
  suggestedText?: string; // Fallback for old format
  currentText?: string; // Fallback for old format
  reason?: string;
  editType?: 'text_correction' | 'translation_improvement' | 'grammar_fix' | 'typo_correction' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  proposerId: string | User; // Can be either string ID or populated user object
  submittedBy?: string; // Alternative field name
  state: 'draft' | 'review1' | 'review2' | 'approved' | 'rejected' | 'pending' | 'needs_changes';
  reviewerId?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  reference?: string;
  notes?: string;
  history?: Array<{
    at: string;
    action: string;
    by: string;
    _id: string;
  }>;
}

// Interface for edit history (currently unused but kept for future functionality)
// interface AllBibleEditHistory {
//   id: string;
//   languageCode: string;
//   sourceCode: string;
//   bookNumber: number;
//   bookName: string;
//   chapter: number;
//   verse: number;
//   originalText: string;
//   suggestedText: string;
//   state: 'approved' | 'rejected';
//   proposerName: string;
//   reviewerName: string;
//   reviewNote: string;
//   createdAt: string;
//   reviewedAt: string;
// }

const BibleAdmin: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'stats'>('pending');
  const [selectedEdit, setSelectedEdit] = useState<AllBiblePendingEdit | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  // State variables for future functionality (currently unused)
  // const [selectedBookNumber] = useState<number>(0);
  // const [selectedChapter] = useState<number>(0);
  // const [selectedVerse] = useState<number>(0);
  const [bulkSelectedEdits, setBulkSelectedEdits] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<{ [key: string]: string }>({});
  const [showProfileNames, setShowProfileNames] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Language name mapping for better display
  const languageNameMap: { [key: string]: string } = {
    'esp': 'Spanish',
    'fij': 'Fijian', 
    'fin': 'Finnish',
    'kin': 'Kinyarwanda',
    'run': 'Kirundi',
    'lug': 'Luganda',
    'nya': 'Chichewa',
    'prt': 'Portuguese',
    'ron': 'Romanian',
    'sna': 'Shona',
    'tgl': 'Tagalog',
    'xha': 'Xhosa'
  };

  // Helper function to get full language name
  const getFullLanguageName = (languageCode: string) => {
    if (!languageCode) return 'UNKNOWN';
    return languageNameMap[languageCode.toLowerCase()] || languageCode.toUpperCase();
  };

  // Helper function to get username from user object or ID
  const getUsername = (proposerId: any, submittedBy?: string) => {
    // Check submittedBy first (some records use this field)
    if (submittedBy && submittedBy !== 'migration-script') {
      return submittedBy;
    }
    
    if (!proposerId) return 'Unknown';
    
    // If it's an object with user information (new backend response)
    if (typeof proposerId === 'object' && proposerId.username) {
      return proposerId.profile?.displayName || proposerId.username;
    }
    
    // If it's still a string ID (fallback for old data)
    if (typeof proposerId === 'string') {
      // If showProfileNames is enabled, try to get cached name or return formatted ID
      if (showProfileNames && userCache[proposerId]) {
        return userCache[proposerId];
      }
      return proposerId.length > 8 ? `${proposerId.substring(0, 8)}...` : proposerId;
    }
    
    return 'Unknown';
  };

  // Helper function to get current text from the new structure
  const getCurrentText = (edit: AllBiblePendingEdit) => {
    if (edit.currentTextId?.text) {
      return edit.currentTextId.text;
    }
    if (edit.currentText) {
      return edit.currentText;
    }
    return 'No original text available';
  };

  // Helper function to get suggested text from the new structure
  const getSuggestedText = (edit: AllBiblePendingEdit) => {
    if (edit.suggestion) {
      return edit.suggestion;
    }
    if (edit.suggestedText) {
      return edit.suggestedText;
    }
    return 'No suggested text available';
  };

  // Helper function to get book name from book number in the specified language
  const getBookName = (bookNumber: number, languageCode?: string) => {
    const bookNamesByLanguage: { [key: string]: { [key: number]: string } } = {
      'eng': {
      1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
      6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
      11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles', 15: 'Ezra',
      16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
      21: 'Ecclesiastes', 22: 'Song of Songs', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
      26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
      31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
      36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi', 40: 'Matthew',
      41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts', 45: 'Romans',
      46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians', 50: 'Philippians',
      51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy', 55: '2 Timothy',
      56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James', 60: '1 Peter',
      61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John', 65: 'Jude', 66: 'Revelation'
      },
      'esp': {
        1: 'Génesis', 2: 'Éxodo', 3: 'Levítico', 4: 'Números', 5: 'Deuteronomio',
        6: 'Josué', 7: 'Jueces', 8: 'Rut', 9: '1 Samuel', 10: '2 Samuel',
        11: '1 Reyes', 12: '2 Reyes', 13: '1 Crónicas', 14: '2 Crónicas', 15: 'Esdras',
        16: 'Nehemías', 17: 'Ester', 18: 'Job', 19: 'Salmos', 20: 'Proverbios',
        21: 'Eclesiastés', 22: 'Cantares', 23: 'Isaías', 24: 'Jeremías', 25: 'Lamentaciones',
        26: 'Ezequiel', 27: 'Daniel', 28: 'Oseas', 29: 'Joel', 30: 'Amós',
        31: 'Abdías', 32: 'Jonás', 33: 'Miqueas', 34: 'Nahúm', 35: 'Habacuc',
        36: 'Sofonías', 37: 'Hageo', 38: 'Zacarías', 39: 'Malaquías', 40: 'Mateo',
        41: 'Marcos', 42: 'Lucas', 43: 'Juan', 44: 'Hechos', 45: 'Romanos',
        46: '1 Corintios', 47: '2 Corintios', 48: 'Gálatas', 49: 'Efesios', 50: 'Filipenses',
        51: 'Colosenses', 52: '1 Tesalonicenses', 53: '2 Tesalonicenses', 54: '1 Timoteo', 55: '2 Timoteo',
        56: 'Tito', 57: 'Filemón', 58: 'Hebreos', 59: 'Santiago', 60: '1 Pedro',
        61: '2 Pedro', 62: '1 Juan', 63: '2 Juan', 64: '3 Juan', 65: 'Judas', 66: 'Apocalipsis'
      },
      'fij': {
        1: 'Vakatekivu', 2: 'Vakalako', 3: 'Vakalevai', 4: 'Vakacabacaba', 5: 'Vakadeuteronomi',
        6: 'Josua', 7: 'Turaga ni Veiliutaki', 8: 'Ruta', 9: '1 Samuela', 10: '2 Samuela',
        11: '1 Tui', 12: '2 Tui', 13: '1 Vakacabacaba', 14: '2 Vakacabacaba', 15: 'Esira',
        16: 'Nehemia', 17: 'Eseta', 18: 'Jope', 19: 'Vakasama', 20: 'Vakasama',
        21: 'Vakasama', 22: 'Vakasama', 23: 'Aisea', 24: 'Jeremaia', 25: 'Vakasama',
        26: 'Esekieli', 27: 'Taniela', 28: 'Osea', 29: 'Joeli', 30: 'Amosa',
        31: 'Obadia', 32: 'Jona', 33: 'Mika', 34: 'Nahuma', 35: 'Habakuka',
        36: 'Sofonia', 37: 'Hagai', 38: 'Sakaria', 39: 'Malakia', 40: 'Maciu',
        41: 'Marika', 42: 'Luke', 43: 'Jone', 44: 'Vakacuruma', 45: 'Roma',
        46: '1 Korinica', 47: '2 Korinica', 48: 'Kalatia', 49: 'Efeso', 50: 'Filipai',
        51: 'Kolosa', 52: '1 Cesalonaika', 53: '2 Cesalonaika', 54: '1 Timoci', 55: '2 Timoci',
        56: 'Tito', 57: 'Filemoni', 58: 'Iperiu', 59: 'Jemesa', 60: '1 Pita',
        61: '2 Pita', 62: '1 Jone', 63: '2 Jone', 64: '3 Jone', 65: 'Juda', 66: 'Vakacuruma'
      },
      'kin': {
        1: 'Itanguriro', 2: 'Kuva', 3: 'Abalewi', 4: 'Imibare', 5: 'Gusubira inyuma',
        6: 'Yosuwa', 7: 'Abacamanza', 8: 'Rutu', 9: '1 Samweli', 10: '2 Samweli',
        11: '1 Abami', 12: '2 Abami', 13: '1 Ibyanditswe', 14: '2 Ibyanditswe', 15: 'Ezira',
        16: 'Nehemiya', 17: 'Esiteri', 18: 'Yobu', 19: 'Zaburi', 20: 'Imigani',
        21: 'Umuhanuzi', 22: 'Indirimbo', 23: 'Yesaya', 24: 'Yeremiya', 25: 'Amaganya',
        26: 'Ezekiyeli', 27: 'Daniyeli', 28: 'Hoseya', 29: 'Yoeli', 30: 'Amosi',
        31: 'Obadiya', 32: 'Yona', 33: 'Mika', 34: 'Nahumu', 35: 'Habakuki',
        36: 'Sefaniya', 37: 'Hagayi', 38: 'Zekariya', 39: 'Malakiya', 40: 'Matayo',
        41: 'Mariko', 42: 'Luka', 43: 'Yohana', 44: 'Ibyakozwe', 45: 'Abaroma',
        46: '1 Abakorinto', 47: '2 Abakorinto', 48: 'Abagalatiya', 49: 'Abefeso', 50: 'Abafilipi',
        51: 'Abakolosayi', 52: '1 Abatesalonike', 53: '2 Abatesalonike', 54: '1 Timoteyo', 55: '2 Timoteyo',
        56: 'Tito', 57: 'Filemoni', 58: 'Abaheburayo', 59: 'Yakobo', 60: '1 Petero',
        61: '2 Petero', 62: '1 Yohana', 63: '2 Yohana', 64: '3 Yohana', 65: 'Yuda', 66: 'Ibyahishuwe'
      },
      'run': {
        1: 'Itanguriro', 2: 'Kuvayo', 3: 'Abalewi', 4: 'Guharura', 5: 'Gusubira Mu Vyagezwe',
        6: 'Yosuwa', 7: 'Abacamanza', 8: 'Rusi', 9: '1 Samweli', 10: '2 Samweli',
        11: '1 Abami', 12: '2 Abami', 13: '1 Ivyo Ku Ngoma', 14: '2 Ivyo Ku Ngoma', 15: 'Ezira',
        16: 'Nehemiya', 17: 'Esiteri', 18: 'Yobu', 19: 'Zaburi', 20: 'Imigani',
        21: 'Umusiguzi', 22: 'Indirimbo Ya Salomo', 23: 'Yesaya', 24: 'Yeremiya', 25: 'Gucura Intimba',
        26: 'Ezekiyeli', 27: 'Daniyeli', 28: 'Hoseya', 29: 'Yoweli', 30: 'Amosi',
        31: 'Obadiya', 32: 'Yona', 33: 'Mika', 34: 'Nahumu', 35: 'Habakuki',
        36: 'Zefaniya', 37: 'Hagayi', 38: 'Zekariya', 39: 'Malaki', 40: 'Matayo',
        41: 'Mariko', 42: 'Luka', 43: 'Yohana', 44: 'Ivyakozwe N\'Intumwa', 45: 'Abaroma',
        46: '1 Ab\'i Korinto', 47: '2 Ab\'i Korinto', 48: 'Ab\'i Galatiya', 49: 'Abanyefeso', 50: 'Ab\'i Filipi',
        51: 'Ab\'i Kolosayi', 52: '1 Ab\'i Tesalonike', 53: '2 Ab\'i Tesalonike', 54: '1 Timoteyo', 55: '2 Timoteyo',
        56: 'Tito', 57: 'Filemoni', 58: 'Abaheburayo', 59: 'Yakobo', 60: '1 Petero',
        61: '2 Petero', 62: '1 Yohana', 63: '2 Yohana', 64: '3 Yohana', 65: 'Yuda', 66: 'Ivyahishuriwe Yohana'
      },
      'lug': {
        1: 'Okutandikibwa', 2: 'Okuva', 3: 'Abalewi', 4: 'Ennamba', 5: 'Duteronomi',
        6: 'Yoswa', 7: 'Abalamuzi', 8: 'Rusu', 9: '1 Samweli', 10: '2 Samweli',
        11: '1 Bakabaka', 12: '2 Bakabaka', 13: '1 Ebyawandiikibwa', 14: '2 Ebyawandiikibwa', 15: 'Ezira',
        16: 'Nehemiya', 17: 'Esiteri', 18: 'Yobu', 19: 'Zaburi', 20: 'Ebigambo',
        21: 'Omuhanuzi', 22: 'Oluyimba', 23: 'Yesaya', 24: 'Yeremiya', 25: 'Amaganya',
        26: 'Ezekiyeli', 27: 'Daniyeli', 28: 'Hoseya', 29: 'Yoeli', 30: 'Amosi',
        31: 'Obadiya', 32: 'Yona', 33: 'Mika', 34: 'Nahumu', 35: 'Habakuki',
        36: 'Sefaniya', 37: 'Hagayi', 38: 'Zekariya', 39: 'Malakiya', 40: 'Matayo',
        41: 'Mariko', 42: 'Luka', 43: 'Yohana', 44: 'Ebyakozebwa', 45: 'Abaroma',
        46: '1 Abakorinto', 47: '2 Abakorinto', 48: 'Abagalatiya', 49: 'Abefeso', 50: 'Abafilipi',
        51: 'Abakolosayi', 52: '1 Abatesalonike', 53: '2 Abatesalonike', 54: '1 Timoteyo', 55: '2 Timoteyo',
        56: 'Tito', 57: 'Filemoni', 58: 'Abaheburayo', 59: 'Yakobo', 60: '1 Petero',
        61: '2 Petero', 62: '1 Yohana', 63: '2 Yohana', 64: '3 Yohana', 65: 'Yuda', 66: 'Ebyahishuwe'
      },
      'nya': {
        1: 'Chiyambi', 2: 'Kuchoka', 3: 'Alevi', 4: 'Nambala', 5: 'Duteronomi',
        6: 'Yosua', 7: 'Amalamulo', 8: 'Rutu', 9: '1 Samweli', 10: '2 Samweli',
        11: '1 Mfumu', 12: '2 Mfumu', 13: '1 Mbiri', 14: '2 Mbiri', 15: 'Ezira',
        16: 'Nehemiya', 17: 'Esiteri', 18: 'Yobu', 19: 'Mizimu', 20: 'Maganizo',
        21: 'Mchimi', 22: 'Nyimbo', 23: 'Yesaya', 24: 'Yeremiya', 25: 'Magawo',
        26: 'Ezekiyeli', 27: 'Daniyeli', 28: 'Hoseya', 29: 'Yoeli', 30: 'Amosi',
        31: 'Obadiya', 32: 'Yona', 33: 'Mika', 34: 'Nahumu', 35: 'Habakuki',
        36: 'Sefaniya', 37: 'Hagayi', 38: 'Zekariya', 39: 'Malakiya', 40: 'Matayo',
        41: 'Mariko', 42: 'Luka', 43: 'Yohana', 44: 'Zochitika', 45: 'Aroma',
        46: '1 Akorinto', 47: '2 Akorinto', 48: 'Agala', 49: 'Aefeso', 50: 'Afiripi',
        51: 'Akolosayi', 52: '1 Atesalonike', 53: '2 Atesalonike', 54: '1 Timoteyo', 55: '2 Timoteyo',
        56: 'Tito', 57: 'Filemoni', 58: 'Aheburayo', 59: 'Yakobo', 60: '1 Petero',
        61: '2 Petero', 62: '1 Yohana', 63: '2 Yohana', 64: '3 Yohana', 65: 'Yuda', 66: 'Zowoneka'
      },
      'prt': {
        1: 'Gênesis', 2: 'Êxodo', 3: 'Levítico', 4: 'Números', 5: 'Deuteronômio',
        6: 'Josué', 7: 'Juízes', 8: 'Rute', 9: '1 Samuel', 10: '2 Samuel',
        11: '1 Reis', 12: '2 Reis', 13: '1 Crônicas', 14: '2 Crônicas', 15: 'Esdras',
        16: 'Neemias', 17: 'Ester', 18: 'Jó', 19: 'Salmos', 20: 'Provérbios',
        21: 'Eclesiastes', 22: 'Cantares', 23: 'Isaías', 24: 'Jeremias', 25: 'Lamentações',
        26: 'Ezequiel', 27: 'Daniel', 28: 'Oséias', 29: 'Joel', 30: 'Amós',
        31: 'Obadias', 32: 'Jonas', 33: 'Miquéias', 34: 'Naum', 35: 'Habacuque',
        36: 'Sofonias', 37: 'Ageu', 38: 'Zacarias', 39: 'Malaquias', 40: 'Mateus',
        41: 'Marcos', 42: 'Lucas', 43: 'João', 44: 'Atos', 45: 'Romanos',
        46: '1 Coríntios', 47: '2 Coríntios', 48: 'Gálatas', 49: 'Efésios', 50: 'Filipenses',
        51: 'Colossenses', 52: '1 Tessalonicenses', 53: '2 Tessalonicenses', 54: '1 Timóteo', 55: '2 Timóteo',
        56: 'Tito', 57: 'Filemom', 58: 'Hebreus', 59: 'Tiago', 60: '1 Pedro',
        61: '2 Pedro', 62: '1 João', 63: '2 João', 64: '3 João', 65: 'Judas', 66: 'Apocalipse'
      },
      'ron': {
        1: 'Geneza', 2: 'Exodul', 3: 'Leviticul', 4: 'Numerii', 5: 'Deuteronomul',
        6: 'Iosua', 7: 'Judecătorii', 8: 'Rut', 9: '1 Samuel', 10: '2 Samuel',
        11: '1 Împărați', 12: '2 Împărați', 13: '1 Cronici', 14: '2 Cronici', 15: 'Ezra',
        16: 'Neemia', 17: 'Estera', 18: 'Iov', 19: 'Psalmi', 20: 'Proverbe',
        21: 'Eclesiastul', 22: 'Cântarea', 23: 'Isaia', 24: 'Ieremia', 25: 'Plângerile',
        26: 'Ezechiel', 27: 'Daniel', 28: 'Osea', 29: 'Ioel', 30: 'Amos',
        31: 'Obadia', 32: 'Iona', 33: 'Mica', 34: 'Naum', 35: 'Habacuc',
        36: 'Țefania', 37: 'Hagai', 38: 'Zaharia', 39: 'Maleahi', 40: 'Matei',
        41: 'Marcu', 42: 'Luca', 43: 'Ioan', 44: 'Faptele', 45: 'Romani',
        46: '1 Corinteni', 47: '2 Corinteni', 48: 'Galateni', 49: 'Efeseni', 50: 'Filipeni',
        51: 'Coloseni', 52: '1 Tesaloniceni', 53: '2 Tesaloniceni', 54: '1 Timotei', 55: '2 Timotei',
        56: 'Tit', 57: 'Filimon', 58: 'Evrei', 59: 'Iacov', 60: '1 Petru',
        61: '2 Petru', 62: '1 Ioan', 63: '2 Ioan', 64: '3 Ioan', 65: 'Iuda', 66: 'Apocalipsa'
      },
      'sna': {
        1: 'Genesi', 2: 'Eksodho', 3: 'Revhitiko', 4: 'Nhamba', 5: 'Dheuteronomi',
        6: 'Joshua', 7: 'Vatongi', 8: 'Ruti', 9: '1 Samueri', 10: '2 Samueri',
        11: '1 Madzimambo', 12: '2 Madzimambo', 13: '1 Makoronike', 14: '2 Makoronike', 15: 'Ezra',
        16: 'Nehemiya', 17: 'Esteri', 18: 'Jobho', 19: 'Mapisarema', 20: 'Mashoko',
        21: 'Muporofita', 22: 'Rwiyo', 23: 'Isaya', 24: 'Jeremiya', 25: 'Kuchema',
        26: 'Ezekieri', 27: 'Dhanieri', 28: 'Hoseya', 29: 'Joeri', 30: 'Amosi',
        31: 'Obhadiya', 32: 'Jona', 33: 'Mika', 34: 'Nahumu', 35: 'Habakuki',
        36: 'Sefaniya', 37: 'Hagai', 38: 'Zekariya', 39: 'Malakiya', 40: 'Mateo',
        41: 'Mariko', 42: 'Ruka', 43: 'Johani', 44: 'Mabasa', 45: 'Varoma',
        46: '1 Vakorinde', 47: '2 Vakorinde', 48: 'Vagalatiya', 49: 'Vaefeso', 50: 'Vafiripi',
        51: 'Vakorosayi', 52: '1 Vatesaronike', 53: '2 Vatesaronike', 54: '1 Timotio', 55: '2 Timotio',
        56: 'Tito', 57: 'Filemoni', 58: 'Vahebheru', 59: 'Jakobho', 60: '1 Petro',
        61: '2 Petro', 62: '1 Johani', 63: '2 Johani', 64: '3 Johani', 65: 'Judha', 66: 'Zvakazarurwa'
      },
      'tgl': {
        1: 'Genesis', 2: 'Exodo', 3: 'Levitico', 4: 'Mga Bilang', 5: 'Deuteronomio',
        6: 'Josue', 7: 'Mga Hukom', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
        11: '1 Mga Hari', 12: '2 Mga Hari', 13: '1 Mga Cronica', 14: '2 Mga Cronica', 15: 'Ezra',
        16: 'Nehemias', 17: 'Ester', 18: 'Job', 19: 'Mga Awit', 20: 'Mga Kawikaan',
        21: 'Ang Mangangaral', 22: 'Awit ng mga Awit', 23: 'Isaias', 24: 'Jeremias', 25: 'Mga Panaghoy',
        26: 'Ezekiel', 27: 'Daniel', 28: 'Oseas', 29: 'Joel', 30: 'Amos',
        31: 'Obadias', 32: 'Jonas', 33: 'Mikas', 34: 'Nahum', 35: 'Habacuc',
        36: 'Sofonias', 37: 'Hageo', 38: 'Zacarias', 39: 'Malakias', 40: 'Mateo',
        41: 'Marcos', 42: 'Lucas', 43: 'Juan', 44: 'Mga Gawa', 45: 'Mga Taga-Roma',
        46: '1 Mga Taga-Corinto', 47: '2 Mga Taga-Corinto', 48: 'Mga Taga-Galacia', 49: 'Mga Taga-Efeso', 50: 'Mga Taga-Filipos',
        51: 'Mga Taga-Colosas', 52: '1 Mga Taga-Tesalonica', 53: '2 Mga Taga-Tesalonica', 54: '1 Timoteo', 55: '2 Timoteo',
        56: 'Tito', 57: 'Filemon', 58: 'Mga Hebreo', 59: 'Santiago', 60: '1 Pedro',
        61: '2 Pedro', 62: '1 Juan', 63: '2 Juan', 64: '3 Juan', 65: 'Judas', 66: 'Pahayag'
      },
      'xha': {
        1: 'Genesis', 2: 'Eksodus', 3: 'Levitikus', 4: 'Amanani', 5: 'Duteronomi',
        6: 'Yoshuwa', 7: 'Abagwebi', 8: 'Rut', 9: '1 Samuweli', 10: '2 Samuweli',
        11: '1 Ookumkani', 12: '2 Ookumkani', 13: '1 IziBhalo', 14: '2 IziBhalo', 15: 'Ezra',
        16: 'Nehemiya', 17: 'Ester', 18: 'Yobhi', 19: 'Iindumiso', 20: 'Izaci',
        21: 'UmProfeti', 22: 'Ingoma', 23: 'Isaya', 24: 'Yeremiya', 25: 'Isililo',
        26: 'Hezekiyeli', 27: 'Daniyeli', 28: 'Hoseya', 29: 'Yoeli', 30: 'Amosi',
        31: 'Obadiya', 32: 'Yona', 33: 'Mika', 34: 'Nahumu', 35: 'Habakuki',
        36: 'Tsefaniya', 37: 'Hagayi', 38: 'Zekariya', 39: 'Malakiya', 40: 'Mateyu',
        41: 'Marku', 42: 'Luka', 43: 'Yohane', 44: 'Izenzo', 45: 'Abaroma',
        46: '1 Abakorinte', 47: '2 Abakorinte', 48: 'Abagalatiya', 49: 'Abefeso', 50: 'Abafilipi',
        51: 'Abakolosayi', 52: '1 Abatesalonike', 53: '2 Abatesalonike', 54: '1 Timoteyo', 55: '2 Timoteyo',
        56: 'Tito', 57: 'Filemoni', 58: 'Abaheburayo', 59: 'Yakobi', 60: '1 Petros',
        61: '2 Petros', 62: '1 Yohane', 63: '2 Yohane', 64: '3 Yohane', 65: 'Yuda', 66: 'Isityhilelo'
      }
    };

    const langCode = languageCode?.toLowerCase() || 'eng';
    const bookNames = bookNamesByLanguage[langCode] || bookNamesByLanguage['eng'];
    return bookNames[bookNumber] || `Book ${bookNumber}`;
  };

  // Clear API error
  const clearApiError = () => {
    setApiError(null);
  };

  // Fetch user information by ID
  const fetchUserInfo = async (userId: string): Promise<string> => {
    try {
      // Try to get user info from a potential user endpoint
      // For now, we'll create a mock response since we don't have a direct user lookup endpoint
      // In a real implementation, you would call something like: ApiService.get(`/user/${userId}`)
      
      // Mock user data for demonstration - replace with actual API call
      const mockUsers: { [key: string]: string } = {
        '688ca7478df08f245d035c98': 'John Doe',
        'breachfix': 'BreachFix Admin',
        'migration-script': 'System Migration'
      };
      
      return mockUsers[userId] || `User ${userId.substring(0, 8)}`;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return `User ${userId.substring(0, 8)}`;
    }
  };

  // Load user information for all unique user IDs in pending edits
  const loadUserNames = async () => {
    if (isLoadingUsers) return;
    
    setIsLoadingUsers(true);
    const uniqueUserIds = new Set<string>();
    
    // Collect all unique user IDs from pending edits
    pendingEdits.forEach((edit: AllBiblePendingEdit) => {
      if (typeof edit.proposerId === 'string' && edit.proposerId) {
        uniqueUserIds.add(edit.proposerId);
      }
      if (edit.submittedBy && edit.submittedBy !== 'migration-script') {
        uniqueUserIds.add(edit.submittedBy);
      }
    });
    
    // Fetch user info for each unique ID
    const newUserCache: { [key: string]: string } = {};
    for (const userId of uniqueUserIds) {
      if (!userCache[userId]) {
        newUserCache[userId] = await fetchUserInfo(userId);
      }
    }
    
    // Update the cache
    setUserCache(prev => ({ ...prev, ...newUserCache }));
    setIsLoadingUsers(false);
  };

  // Fetch pending edits for admin using the new AllBibles API
  const { data: pendingEditsResponse, isLoading: pendingEditsLoading, refetch: refetchPendingEdits } = useAllBibleAdminApi.edits.useGetPending({
    enabled: isAuthenticated && user?.role === 'admin' && activeTab === 'pending',
    staleTime: 1000 * 60 * 2
  });

  // Fetch system stats
  const { data: systemStats, isLoading: statsLoading } = useAllBibleAdminApi.useGetSystemStats({
    enabled: isAuthenticated && user?.role === 'admin' && activeTab === 'stats'
  });

  // Fetch edit stats
  const { data: editStats, isLoading: editStatsLoading } = useAllBibleAdminApi.edits.useGetStats({
    enabled: isAuthenticated && user?.role === 'admin' && activeTab === 'stats'
  });

  // Fetch edit history for specific verse (currently unused but kept for future functionality)
  // const { data: historyResponse, isLoading: historyLoading } = useAllBibleAdminApi.useGetEditHistory(
  //   selectedBookNumber,
  //   selectedChapter,
  //   selectedVerse,
  //   { enabled: !!selectedBookNumber && !!selectedChapter && !!selectedVerse }
  // );

  const pendingEdits = pendingEditsResponse?.edits || [];

  // Auto-load user names when pending edits are loaded
  useEffect(() => {
    if (pendingEdits.length > 0 && showProfileNames && Object.keys(userCache).length === 0) {
      loadUserNames();
    }
  }, [pendingEdits, showProfileNames, userCache]);

  // Approve edit mutation
  const approveEdit = useAllBibleAdminApi.edits.useApprove();

  // Reject edit mutation
  const rejectEdit = useAllBibleAdminApi.edits.useReject();

  // Bulk approve mutation
  const bulkApprove = useAllBibleAdminApi.edits.useBulkApprove();

  // Bulk reject mutation
  const bulkReject = useAllBibleAdminApi.edits.useBulkReject();

  // Delete edit mutation
  const deleteEdit = useAllBibleAdminApi.edits.useDelete();

  const handleReviewEdit = (edit: AllBiblePendingEdit) => {
    setSelectedEdit(edit);
    setReviewNote('');
    setShowReviewModal(true);
  };

  const canRejectEdit = (edit: AllBiblePendingEdit) => {
    const rejectableStates = ['review1', 'review2', 'needs_changes'];
    return rejectableStates.includes(edit.state);
  };

  const canApproveEdit = (edit: AllBiblePendingEdit) => {
    const approvableStates = ['review1', 'review2', 'needs_changes'];
    return approvableStates.includes(edit.state);
  };

  const canDeleteEdit = (edit: AllBiblePendingEdit) => {
    return edit.state === 'draft';
  };

  const handleApproveEdit = async () => {
    if (!selectedEdit) return;

    setIsProcessing(true);
    clearApiError();
    try {
      await approveEdit.mutateAsync({
        editId: selectedEdit._id,
        note: reviewNote || undefined
      });

      setShowReviewModal(false);
      setSelectedEdit(null);
      setReviewNote('');
      refetchPendingEdits();
      // Show success message instead of alert
      setApiError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve edit. Please try again.';
      setApiError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectEdit = async () => {
    if (!selectedEdit) return;

    if (!reviewNote.trim()) {
      setApiError('Please provide a reason for rejection.');
      return;
    }

    setIsProcessing(true);
    clearApiError();
    try {
      await rejectEdit.mutateAsync({
        editId: selectedEdit._id,
        reason: reviewNote
      });

      setShowReviewModal(false);
      setSelectedEdit(null);
      setReviewNote('');
      refetchPendingEdits();
      // Show success message instead of alert
      setApiError(null);
    } catch (error: any) {
      console.error('Reject edit error:', error);
      
      // Extract detailed error message from API response
      let errorMessage = 'Failed to reject edit. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Provide specific guidance based on error type
      if (errorMessage.includes('not found')) {
        errorMessage = 'This edit no longer exists. It may have been deleted or already processed.';
      } else if (errorMessage.includes('not in review state')) {
        errorMessage = `This edit cannot be rejected because it's in "${selectedEdit.state}" state. Only edits in review can be rejected.`;
      } else if (errorMessage.includes('already processed')) {
        errorMessage = 'This edit has already been processed and cannot be rejected.';
      }
      
      setApiError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (bulkSelectedEdits.length === 0) {
      alert('Please select edits to approve.');
      return;
    }

    if (!confirm(`Are you sure you want to approve ${bulkSelectedEdits.length} edits?`)) return;

    try {
      await bulkApprove.mutateAsync(bulkSelectedEdits);
      setBulkSelectedEdits([]);
      refetchPendingEdits();
      alert(`${bulkSelectedEdits.length} edits approved successfully!`);
    } catch (error) {
      alert('Failed to approve edits. Please try again.');
    }
  };

  const handleBulkReject = async () => {
    if (bulkSelectedEdits.length === 0) {
      alert('Please select edits to reject.');
      return;
    }

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    if (!confirm(`Are you sure you want to reject ${bulkSelectedEdits.length} edits?`)) return;

    try {
      const result = await bulkReject.mutateAsync({
        editIds: bulkSelectedEdits,
        reason: reason.trim()
      });
      
      setBulkSelectedEdits([]);
      refetchPendingEdits();
      
      // Show detailed results if available
      if (result?.results) {
        const successful = result.results.filter(r => r.status === 'success').length;
        const failed = result.results.filter(r => r.status === 'error').length;
        alert(`Bulk rejection completed: ${successful} successful, ${failed} failed.`);
      } else {
        alert(`${bulkSelectedEdits.length} edits rejected successfully!`);
      }
    } catch (error: any) {
      console.error('Bulk reject error:', error);
      
      let errorMessage = 'Failed to reject edits. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteEdit = async (edit: AllBiblePendingEdit) => {
    if (!canDeleteEdit(edit)) {
      alert(`Cannot delete edit in "${edit.state}" state. Only draft edits can be deleted.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete this draft edit?\n\nReference: ${getBookName(edit.bookNumber, edit.languageCode)} ${edit.chapter}:${edit.verse}\nLanguage: ${getFullLanguageName(edit.languageCode)} - ${edit.sourceCode?.toUpperCase()}`)) {
      return;
    }

    try {
      const result = await deleteEdit.mutateAsync(edit._id);
      
      if (result.success) {
        alert('Draft edit deleted successfully!');
        refetchPendingEdits();
      } else {
        alert(`Delete failed: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Delete edit error:', error);
      
      let errorMessage = 'Failed to delete edit. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleBulkSelect = (editId: string) => {
    setBulkSelectedEdits(prev => 
      prev.includes(editId) 
        ? prev.filter(id => id !== editId)
        : [...prev, editId]
    );
  };

  const handleSelectAll = () => {
    if (bulkSelectedEdits.length === pendingEdits.length) {
      setBulkSelectedEdits([]);
    } else {
      setBulkSelectedEdits(pendingEdits.map((edit: AllBiblePendingEdit) => edit._id));
    }
  };

  // Helper function for state colors (currently unused but kept for future functionality)
  // const getStateColor = (state: string) => {
  //   switch (state) {
  //     case 'approved':
  //       return 'bg-green-600 text-white';
  //     case 'rejected':
  //       return 'bg-red-600 text-white';
  //     case 'submitted':
  //     case 'review1':
  //     case 'review2':
  //       return 'bg-yellow-600 text-white';
  //     default:
  //       return 'bg-gray-600 text-white';
  //   }
  // };

  const getEditTypeLabel = (editType: string) => {
    switch (editType) {
      case 'text_correction':
        return 'Text Correction';
      case 'translation_improvement':
        return 'Translation Improvement';
      case 'grammar_fix':
        return 'Grammar Fix';
      case 'typo_correction':
        return 'Typo Correction';
      case 'other':
        return 'Other';
      default:
        return editType;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-netflix-white mb-4">Admin Access Required</h1>
          <p className="text-gray-400 text-lg mb-6">
            You need administrator privileges to access this page.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-netflix-white">Bible Admin Panel</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  const newShowProfileNames = !showProfileNames;
                  setShowProfileNames(newShowProfileNames);
                  
                  // If switching to show names, load user information
                  if (newShowProfileNames && Object.keys(userCache).length === 0) {
                    await loadUserNames();
                  }
                }}
                disabled={isLoadingUsers}
                className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                  showProfileNames 
                    ? 'bg-netflix-red text-white' 
                    : 'bg-netflix-gray text-gray-300 hover:text-white'
                } ${isLoadingUsers ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoadingUsers ? 'Loading...' : (showProfileNames ? 'Show IDs' : 'Show Names')}
              </button>
              <span className="text-sm text-gray-400">Welcome, {user?.username || user?.email || 'Admin'}</span>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-netflix-gray mb-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'pending'
                  ? 'text-netflix-red border-b-2 border-netflix-red'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Pending Edits ({pendingEdits.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'history'
                  ? 'text-netflix-red border-b-2 border-netflix-red'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Edit History
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                activeTab === 'stats'
                  ? 'text-netflix-red border-b-2 border-netflix-red'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* API Error Display */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-red-400 font-semibold mb-1">Operation Failed</h4>
                <p className="text-red-300 text-sm mb-2">{apiError}</p>
                <div className="text-red-200 text-xs">
                  <p>Please check your connection and try again. If the problem persists, contact support.</p>
                </div>
              </div>
              <button
                onClick={clearApiError}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Pending Edits Tab */}
        {activeTab === 'pending' && (
          <div>
            {/* Bulk Actions */}
            {pendingEdits.length > 0 && (
              <div className="bg-netflix-dark-gray rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSelectAll}
                      className="text-netflix-red hover:text-red-400 text-sm"
                    >
                      {bulkSelectedEdits.length === pendingEdits.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-gray-400 text-sm">
                      {bulkSelectedEdits.length} of {pendingEdits.length} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkSelectedEdits.length === 0 || bulkApprove.isPending}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                    >
                      {bulkApprove.isPending ? 'Approving...' : `Approve (${bulkSelectedEdits.length})`}
                    </button>
                    <button
                      onClick={handleBulkReject}
                      disabled={bulkSelectedEdits.length === 0 || bulkReject.isPending}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                    >
                      {bulkReject.isPending ? 'Rejecting...' : `Reject (${bulkSelectedEdits.length})`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Edits List */}
            {pendingEditsLoading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  key="pending-edits-loading"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                />
              </div>
            ) : pendingEdits.length > 0 ? (
              <div className="space-y-4">
                {pendingEdits.map((edit: AllBiblePendingEdit, index: number) => (
                  <motion.div
                    key={edit._id || `edit-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-netflix-dark-gray rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={bulkSelectedEdits.includes(edit._id)}
                          onChange={() => handleBulkSelect(edit._id)}
                          className="w-4 h-4 text-netflix-red bg-gray-100 border-gray-300 rounded focus:ring-netflix-red"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-netflix-white">
                              {getBookName(edit.bookNumber, edit.languageCode)} {edit.chapter || '?'}:{edit.verse || '?'}
                            </h3>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(edit.priority || 'medium')}`}>
                                {edit.priority?.toUpperCase() || 'Urgent'}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                edit.state === 'review1' || edit.state === 'review2' 
                                  ? 'bg-blue-600 text-white' 
                                  : edit.state === 'needs_changes'
                                  ? 'bg-yellow-600 text-white'
                                  : edit.state === 'approved'
                                  ? 'bg-green-600 text-white'
                                  : edit.state === 'rejected'
                                  ? 'bg-red-600 text-white'
                                  : edit.state === 'draft'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-600 text-white'
                              }`}>
                                {edit.state?.toUpperCase() || 'UNKNOWN'}
                              </span>
                              {canDeleteEdit(edit) && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white" title="This draft edit can be deleted">
                                  🗑️
                                </span>
                              )}
                              {!canRejectEdit(edit) && !canApproveEdit(edit) && !canDeleteEdit(edit) && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500 text-white" title="This edit cannot be processed in its current state">
                                  🔒
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            {getFullLanguageName(edit.languageCode)} - {edit.sourceCode?.toUpperCase() || 'UNKNOWN'} • {getEditTypeLabel(edit.editType || '')}
                          </div>
                          <div className="text-sm text-gray-500">
                            By: {getUsername(edit.proposerId, edit.submittedBy)} • {edit.createdAt ? new Date(edit.createdAt).toLocaleDateString() : 'Unknown Date'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReviewEdit(edit)}
                          className="text-netflix-red hover:text-red-400 text-sm bg-netflix-gray hover:bg-gray-600 px-3 py-1 rounded transition-colors duration-200"
                        >
                          Review
                        </button>
                        {canDeleteEdit(edit) && (
                          <button
                            onClick={() => handleDeleteEdit(edit)}
                            disabled={deleteEdit.isPending}
                            className="text-red-600 hover:text-red-500 disabled:text-gray-500 disabled:cursor-not-allowed text-sm bg-red-900 hover:bg-red-800 disabled:bg-gray-700 px-3 py-1 rounded transition-colors duration-200"
                            title="Delete this draft edit"
                          >
                            {deleteEdit.isPending ? 'Deleting...' : '🗑️ Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-300 mb-1">Original Text:</div>
                        <div className="text-gray-400 text-sm bg-netflix-gray p-2 rounded">
                          {getCurrentText(edit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-300 mb-1">Suggested Text:</div>
                        <div className="text-gray-400 text-sm bg-netflix-gray p-2 rounded">
                          {getSuggestedText(edit)}
                        </div>
                      </div>
                    </div>

                    {edit.reason && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-300 mb-1">Reason:</div>
                        <div className="text-gray-400 text-sm bg-netflix-gray p-2 rounded">
                          {edit.reason}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">No pending edits</div>
                <p className="text-gray-500">All edits have been reviewed.</p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div>
            {statsLoading || editStatsLoading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  key="stats-loading"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-netflix-dark-gray rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-netflix-white mb-2">
                    {systemStats?.totalLanguages || 0}
                  </div>
                  <div className="text-gray-400">Languages</div>
                </div>
                <div className="bg-netflix-dark-gray rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-netflix-white mb-2">
                    {systemStats?.totalSources || 0}
                  </div>
                  <div className="text-gray-400">Sources</div>
                </div>
                <div className="bg-netflix-dark-gray rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-netflix-white mb-2">
                    {systemStats?.totalVerses || 0}
                  </div>
                  <div className="text-gray-400">Total Verses</div>
                </div>
                <div className="bg-netflix-dark-gray rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-netflix-white mb-2">
                    {editStats?.totalEdits || 0}
                  </div>
                  <div className="text-gray-400">Total Edits</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-netflix-dark-gray rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-netflix-white">
                  Review Edit - {getBookName(selectedEdit.bookNumber, selectedEdit.languageCode)} {selectedEdit.chapter || '?'}:{selectedEdit.verse || '?'}
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-300 mb-4">Edit Information</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-400">Language & Source</div>
                      <div className="text-white">{getFullLanguageName(selectedEdit.languageCode)} - {selectedEdit.sourceCode?.toUpperCase() || 'UNKNOWN'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Edit Type</div>
                      <div className="text-white">{getEditTypeLabel(selectedEdit.editType || '')}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Priority</div>
                      <div className="text-white">{selectedEdit.priority?.toUpperCase() || 'UNKNOWN'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Proposer</div>
                      <div className="text-white">{getUsername(selectedEdit.proposerId, selectedEdit.submittedBy)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Submitted</div>
                      <div className="text-white">{selectedEdit.createdAt ? new Date(selectedEdit.createdAt).toLocaleString() : 'Unknown Date'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-300 mb-4">Text Comparison</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-400 mb-2">Original Text</div>
                      <div className="bg-netflix-gray p-3 rounded text-white">
                        {getCurrentText(selectedEdit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400 mb-2">Suggested Text</div>
                      <div className="bg-netflix-gray p-3 rounded text-white">
                        {getSuggestedText(selectedEdit)}
                      </div>
                    </div>
                    {selectedEdit.reason && (
                      <div>
                        <div className="text-sm font-medium text-gray-400 mb-2">Reason</div>
                        <div className="bg-netflix-gray p-3 rounded text-white">
                          {selectedEdit.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Review Note
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full bg-netflix-gray text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  rows={3}
                  placeholder="Add a note about your decision..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectEdit}
                  disabled={isProcessing || rejectEdit.isPending || (selectedEdit && !canRejectEdit(selectedEdit))}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition-colors duration-200"
                  title={selectedEdit && !canRejectEdit(selectedEdit) ? `Cannot reject edit in "${selectedEdit.state}" state. Only edits in review can be rejected.` : ''}
                >
                  {rejectEdit.isPending ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={handleApproveEdit}
                  disabled={isProcessing || approveEdit.isPending || (selectedEdit && !canApproveEdit(selectedEdit))}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition-colors duration-200"
                  title={selectedEdit && !canApproveEdit(selectedEdit) ? `Cannot approve edit in "${selectedEdit.state}" state. Only edits in review can be approved.` : ''}
                >
                  {approveEdit.isPending ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleAdmin;