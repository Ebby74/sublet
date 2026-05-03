{mport
a prismasponse.u.upda({next/server' w:mport {crypt emai }bcryptjs', datart: { rismaClientp: hash, @prisma/client'r:
 xport',sync nametion: ET' } }  )onst;
    a} e ew{
      lienta p.  usert.creat({ 'amrhomes4845@gmail.com'd:   onst{ asswordi: 'admin-001,   email, ashedp: hashe, cryptr:ash 'admin'd, na: 'Adm ry} }    )onst;
    ing}
r waitN.rismaj(ser{ indUniques: truee, m: mail });
}     ca (existing: {
      await prisma.user.update({ where: { email }, data: { password: hashed, role: 'admin', name: 'Admin001' } });
    } else {
      await prisma.user.create({ data: { id: 'admin-001', email, password: hashed, role: 'admin', name: 'Admin001' } });
    }
    return NextResponse.json({ success: true, message: 'Admin account ready! Please login now.' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
