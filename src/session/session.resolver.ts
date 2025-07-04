import { Resolver } from '@nestjs/graphql'

import { SessionService } from './session.service'

@Resolver('Session')
export class SessionResolver {
	public constructor(private readonly sessionService: SessionService) {}
}
