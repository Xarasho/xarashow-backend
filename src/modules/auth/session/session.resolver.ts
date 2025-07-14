import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { UserModel } from '../account/models/user.model'
import type { GqlContext } from '../../../shared/types/gql-context.types'

import { LoginInput } from './inputs/login.input'
import { SessionService } from './session.service'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'
// import { Authorization } from '../shared/decorators/auth.decorator'

@Resolver('Session')
export class SessionResolver {
	public constructor(private readonly sessionService: SessionService) {}

	@Mutation(() => UserModel, { name: 'loginUser' })
	public async login(
		@Context() { req }: GqlContext,
		@Args('data') input: LoginInput,
		@UserAgent() userAgent: string
	) {
		return this.sessionService.login(req, input, userAgent)
	}

	// @Authorization()
	@Mutation(() => Boolean, { name: 'logoutUser' })
	public async logout(@Context() { req }: GqlContext) {
		return this.sessionService.logout(req)
	}
}
