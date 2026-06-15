import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateVNPhone(phone: string): boolean {
  // Strip spaces, dots, dashes, and leading country code
  const cleaned = phone.replace(/[\s.\-()]/g, '').replace(/^\+84/, '0').replace(/^84/, '0')
  // Valid Vietnamese mobile prefixes (10 digits starting with 0):
  // Viettel:      032-039, 086, 096, 097, 098
  // Mobifone:     070, 076, 077, 078, 079, 089, 090, 093
  // Vinaphone:    081, 082, 083, 084, 085, 088, 091, 094
  // Vietnamobile: 052, 056, 058, 092
  // Gmobile:      059, 099
  // Reddi:        055
  // Itelecom:     087
  return /^(0(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9]))\d{7}$/.test(cleaned)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

