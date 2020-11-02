import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'
import emailAddresses from 'email-addresses'
import _ from 'lodash'

@Injectable()
export class MailService {
  private transporter: any

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }
  
  public send(mailOptions): Promise<any> {
    mailOptions = _.assign({}, {
      from: `GitLev <${process.env.EMAIL_FROM}>`,
    }, mailOptions)
    
    const promise = new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          return reject(new Error(`mailer could not send a mail to ${this.maskEmail(mailOptions.to)} caused ${err.toString()}`))
        }
        return resolve(response)
      })
    })
    
    return promise
  }

  private maskEmail(email: string): string {
    const parsed = emailAddresses.parseOneAddress(email) as emailAddresses.ParsedMailbox
    const localSplit = parsed.local.split('')
    const local = localSplit[0] + "x".repeat(localSplit.length - 2) + localSplit[localSplit.length - 1]
    return local + '@' + parsed.domain
  }
}