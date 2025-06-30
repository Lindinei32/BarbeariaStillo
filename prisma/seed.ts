import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    console.log('Iniciando o processo de seed...')

    // =================================================================
    // PASSO DE LIMPEZA (MUITO IMPORTANTE!)
    // Apaga os agendamentos existentes para evitar erros
    await prisma.booking.deleteMany({})
    console.log('Agendamentos antigos apagados.')

    // Apaga os serviços existentes para evitar duplicatas e problemas de ordem
    await prisma.barbershopService.deleteMany({})
    console.log('Serviços antigos apagados.')
    // =================================================================

    // 1. Garante que o Admin exista (Upsert é "update or insert")
    const adminEmail = 'stillobarbearia99@gmail.com'
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {}, // Não precisa atualizar nada se já existir
      create: {
        name: 'Barbearia Stillo',
        email: adminEmail,
        role: 'admin',
      },
    })
    console.log('Admin garantido.')

    // 2. Garante que a Barbearia Stillo exista
    const barbershopId = 'clxgmopiv000008k1f2q3h4r5' // ID fixo para a Barbearia Stillo
    const barbershopData = {
      name: 'Barbearia Stillo',
      address: 'Av. Benjamin Possebon, 1041 Quissisana, São José dos Pinhais',
      description: 'Uma barbearia de luxo',
      imageUrl:
        'https://utfs.io/f/988646ea-dcb6-4f47-8a03-8d4586b7bc21-16v.png',
      phones: '(41) 99980-4744, (41) 3382-7953',
    }
    const barbershop = await prisma.barbershop.upsert({
      where: { id: barbershopId },
      update: barbershopData,
      create: { id: barbershopId, ...barbershopData },
    })
    console.log('Barbearia Stillo garantida.')

    // 3. Define os dados COMPLETOS dos serviços com a propriedade 'order'
    const servicesData = [
      {
        name: 'Corte de Cabelo Masculino Adulto',
        description: 'Estilo personalizado com as últimas tendências.',
        price: 35.0,
        imageUrl:
          'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',
        barbershopId: barbershop.id,
        order: 1, // ORDEM 1
      },
      {
        name: 'Corte de Cabelo Infantil',
        description:
          'Um corte que vai fazer seu filho sorrir! Cortes de cabelo infantis com carinho e cuidado.',
        price: 30.0,
        imageUrl: '/CorteInfantil.png',
        barbershopId: barbershop.id,
        order: 2, // ORDEM 2
      },
      {
        name: 'Barba',
        description: 'Modelagem completa para destacar sua masculinidade.',
        price: 30.0,
        imageUrl:
          'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png',
        barbershopId: barbershop.id,
        order: 3, // ORDEM 3
      },
      {
        name: 'Sobrancelha',
        description: 'Expressão acentuada com modelagem precisa.',
        price: 10.0,
        imageUrl:
          'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png',
        barbershopId: barbershop.id,
        order: 4, // ORDEM 4
      },
    ]

    // 4. Cria os serviços (agora em um banco limpo)
    await prisma.barbershopService.createMany({
      data: servicesData,
    })
    console.log('Serviços novos e ordenados foram criados.')

    console.log('Seed concluído com sucesso!')
  } catch (error) {
    console.error('Erro durante o processo de seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
