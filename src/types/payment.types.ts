export type PaymentMethod = 'mobile_money' | 'card' | 'cash'
export type PaymentProvider = 'orange_money' | 'mtn_momo' | 'stripe' | 'cash'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: number
  request_id: number
  amount: number
  total_amount: number
  method: PaymentMethod
  provider: PaymentProvider
  status: PaymentStatus
  transaction_id?: string
  receipt_url?: string
  created_at: string
  completed_at?: string
}

export interface Commission {
  id: number
  payment_id: number
  technician_id: number
  commission_rate: number
  commission_amount: number
  technician_amount: number
  status: 'pending' | 'paid'
  created_at: string
}
