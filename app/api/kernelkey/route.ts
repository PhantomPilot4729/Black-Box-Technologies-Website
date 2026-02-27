import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { kernelKey } = await request.json();
  const kernelKeyHash = process.env.KERNEL_KEY_HASH;
  if (!kernelKeyHash) {
    return NextResponse.json({ success: false, error: "Kernel key hash not set." }, { status: 500 });
  }
  const isMatch = await bcrypt.compare(kernelKey, kernelKeyHash);
  if (isMatch) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: "Invalid kernel key password." }, { status: 401 });
  }
}
