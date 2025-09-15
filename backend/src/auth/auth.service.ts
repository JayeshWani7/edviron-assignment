import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, name, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
    });

    await user.save();

    // Generate JWT token
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }
}