const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

function post(root, args, context) {
	const userId = getUserId(context)
	return context.prisma.createLink({
		url: args.url,
		description: args.description,
		postedBy: { connect: { id: userId } }
	})
}

async function signup(parent, args, context, info) {
	const password = await bcrypt.hash(args.password, 10);

	const user = await context.prisma.createUser({ ...args,  password })

	const token = jwt.sign({ userId: user.id }, APP_SECRET)

	return {
		token,
		user
	}
}

async function login(parent, args, context, info) {
	const user = await context.prisma.user({ email: args.email })
	if (!user) {
		throw new Error('No such user found')
	}

	const password = await bcrypt.hash(args.password, 10);
	const valid = await bcrypt.compare(password, user.password)

	if(valid) {
		throw new Error('Invalid password')
	}

	const token = jwt.sign({ userId: user.id }, APP_SECRET)

	return {
		token,
		user
	}
}


async function vote(parent, args, context, info) {
  // 1
  const userId = getUserId(context)
  console.log(args.linkId)
  // 2
  const linkExists = await context.prisma.$exists.vote({
    user: { id: userId },
    link: { id: args.linkId },
  })
  if (linkExists) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  // 3
  return context.prisma.createVote({
    user: { connect: { id: userId } },
    link: { connect: { id: args.linkId } },
  })
}




module.exports = {
	post,
	signup,
	login,
	vote
}