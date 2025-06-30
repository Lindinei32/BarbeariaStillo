import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    // Crie o admin
    const adminEmail = 'stillobarbearia99@gmail.com'
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    })
    if (!existingAdmin) {
      const adminData = {
        name: 'Barbearia Stillo',
        email: adminEmail, // Use a variável aqui
        role: 'admin',
      }
      await prisma.admin.create({ data: adminData })
    }

    // Crie a barbearia
    const barbershopData = {
      name: 'Barbearia Stillo',
      address: 'Av. Benjamin Possebon, 1041 Quissisana, São José dos Pinhais',
      description: 'Uma barbearia de luxo',
      imageUrl:
        'https://utfs.io/f/988646ea-dcb6-4f47-8a03-8d4586b7bc21-16v.png',
      phones: '(41) 99980-4744, (41) 3382-7953',
    }
    const existingBarbershop = await prisma.barbershop.findFirst({
      where: { name: 'Barbearia Stillo' },
    })
    if (existingBarbershop) {
      await prisma.barbershop.update({
        where: { id: existingBarbershop.id },
        data: barbershopData,
      })
    } else {
      const createdBarbershop = await prisma.barbershop.create({
        data: barbershopData,
      })

      if (createdBarbershop) {
        // Crie os serviços
        const servicesData = [
          {
            name: 'Corte de Cabelo Masculino Adulto',
            description: 'Estilo personalizado com as últimas tendências.',
            price: 35.0,
            imageUrl:
              'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',
            barbershopId: createdBarbershop.id,
          },

          {
            name: 'Corte de Cabelo Infantil',
            description:
              'Um corte que vai fazer seu filho sorrir! Cortes de cabelo infantis com carinho e cuidado.',
            price: 30.0,
            imageUrl:
              '/CorteInfantil.png',
            barbershopId: createdBarbershop.id,
          },

          {
            name: 'Barba',
            description: 'Modelagem completa para destacar sua masculinidade.',
            price: 30.0,
            imageUrl: 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png',
            barbershopId: createdBarbershop.id,
          },

          {
            name: 'Sobrancelha',
            description: 'Expressão acentuada com modelagem precisa.',
            price: 10.0,
            imageUrl:
              'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png',
            barbershopId: createdBarbershop.id,
          },
        ]
        await Promise.all(
          servicesData.map((serviceData) =>
            prisma.barbershopService.create({ data: serviceData }),
          ),
        )
      }
    }
    console.log('Seed concluído com sucesso!')
  } catch (error) {
    console.error('Erro ao criar a barbearia:', error)
  } finally {
    await prisma.$disconnect()
  }
}
seedDatabase()
