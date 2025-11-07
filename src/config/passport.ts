import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { env } from './env';
import prisma from './database';
import { AuthMethod } from '@prisma/client';

// JWT Strategy (for token-based auth)
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
        });
        
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: { id: string; displayName: string; emails?: { value: string }[] },
      done: (error: any, user?: any) => void
    ) => {
      try {
        let user = await prisma.user.findUnique({
          where: {
            providerId_authMethod: { providerId: profile.id, authMethod: AuthMethod.GOOGLE },
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              providerId: profile.id,
              email: profile.emails![0].value,
              name: profile.displayName,
              authMethod: AuthMethod.GOOGLE,
            },
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;