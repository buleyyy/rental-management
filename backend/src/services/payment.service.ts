import { prisma } from "../config/prisma";
import { PaymentStatus } from "@prisma/client";
import { AppError } from "../utils/AppError";

interface CreatePaymentInput {
  contractId: number;
  amount: number;
  paymentDate: string;
  method?: string;
  status?: PaymentStatus;
}

interface UpdatePaymentInput {
  amount?: number;
  paymentDate?: string;
  method?: string;
  status?: PaymentStatus;
}

export class PaymentService {
  /**
   * Ambil semua payments dengan pagination & filter
   */
  async getAll(options?: {
    contractId?: number;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options?.contractId) where.contractId = options.contractId;
    if (options?.status) where.status = options.status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: "desc" },
        include: {
          contract: {
            include: {
              property: true,
              tenant: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ambil payment by ID
   */
  async getById(id: number) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(404, `Payment dengan ID ${id} tidak ditemukan`);
    }

    return payment;
  }

  /**
   * Buat payment baru
   */
  async create(input: CreatePaymentInput) {
    // Validasi contract exists
    const contract = await prisma.contract.findUnique({
      where: { id: input.contractId },
    });

    if (!contract) {
      throw new AppError(
        404,
        `Contract dengan ID ${input.contractId} tidak ditemukan`
      );
    }

    // Validasi contract masih active
    if (contract.status !== "ACTIVE") {
      throw new AppError(
        400,
        "Tidak bisa menambahkan pembayaran untuk kontrak yang tidak aktif"
      );
    }

    const payment = await prisma.payment.create({
      data: {
        contractId: input.contractId,
        amount: input.amount,
        paymentDate: new Date(input.paymentDate),
        method: input.method,
        status: input.status ?? "PAID",
      },
      include: {
        contract: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
    });

    return payment;
  }

  /**
   * Update payment
   */
  async update(id: number, input: UpdatePaymentInput) {
    await this.getById(id); // pastikan payment exists

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        amount: input.amount,
        paymentDate: input.paymentDate
          ? new Date(input.paymentDate)
          : undefined,
        method: input.method,
        status: input.status,
      },
      include: {
        contract: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete payment
   */
  async delete(id: number) {
    await this.getById(id); // pastikan payment exists

    await prisma.payment.delete({ where: { id } });

    return { message: "Payment berhasil dihapus" };
  }
}
