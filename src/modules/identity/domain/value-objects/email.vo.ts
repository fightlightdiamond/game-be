export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    this.value = email;
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getValue(): string {
    return this.value;
  }
}
