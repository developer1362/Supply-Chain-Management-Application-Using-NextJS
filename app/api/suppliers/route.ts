import { NextResponse,NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  const client = await clientPromise
  const db = client.db('supply_chain')

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const supplier = await db.collection('suppliers').findOne({ _id: new ObjectId(id) })
    return NextResponse.json(supplier)
  }

  const suppliers = await db.collection('suppliers').find().toArray()
  return NextResponse.json(suppliers)
}

export async function POST(req: Request) {
  const client = await clientPromise
  const db = client.db('supply_chain')

  const body = await req.json()
  const result = await db.collection('suppliers').insertOne(body)

  return NextResponse.json({ _id: result.insertedId, ...body })
}


export async function PUT(req: NextRequest) {
  const client = await clientPromise
  const db = client.db('supply_chain')

  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing supplier ID' }, { status: 400 })
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid supplier ID format.' }, { status: 400 })
  }
  

  try {
    const body = await req.json()
    
    const result = await db.collection('suppliers').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    )

    if (result.matchedCount === 0) {
        return NextResponse.json({ message: 'Supplier not found.' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Supplier updated' }, { status: 200 })

  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Failed to update supplier.' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const client = await clientPromise
  const db = client.db('supply_chain')

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await db.collection('suppliers').deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ message: 'Supplier deleted' })
}
