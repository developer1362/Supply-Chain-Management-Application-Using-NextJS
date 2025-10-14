import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  const client = await clientPromise
  const db = client.db('supply_chain')

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) })
    return NextResponse.json(product)
  }

  const products = await db.collection('products').find().toArray()
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const client = await clientPromise
  const db = client.db('supply_chain')

  const body = await req.json()
  const result = await db.collection('products').insertOne(body)

  return NextResponse.json({ _id: result.insertedId, ...body })
}

export async function PUT(req: Request) {
  const client = await clientPromise
  const db = client.db('supply_chain')

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await req.json()
  await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: body }
  )

  return NextResponse.json({ message: 'Product updated' })
}

export async function DELETE(req: Request) {
  const client = await clientPromise
  const db = client.db('supply_chain')

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.collection('products').deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ message: 'Product deleted' })
}
