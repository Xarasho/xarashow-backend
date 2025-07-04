import {
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import type { Request } from 'express'

import { PrismaService } from '../core/prisma/prisma.service'

import { LoginInput } from './inputs/login.input'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly config: ConfigService
	) {}

	public async login(req: Request, input: LoginInput) {
		const { login, password } = input

		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ username: { equals: login } },
					{ email: { equals: login } }
				]
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) {
			throw new NotFoundException('Invalid password')
		}

		return new Promise((resolve, reject) => {
			req.session.createdAt = new Date()
			req.session.userId = user.id

			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException('Session save error')
					)
				}

				resolve({ user })
			})
		})
	}

	public async logout(req: Request) {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Session destroy error'
						)
					)
				}

				req.res.clearCookie(
					this.config.getOrThrow<string>('SESSION_NAME')
				)
				resolve(true)
			})
		})
	}
}
